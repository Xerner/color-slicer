import { Observable, Subscriber, forkJoin } from "rxjs";
import { Pixel } from "../models/Pixel";
import { ProcessedImageStore } from "./stores/processed-image.store.service";
import { Injectable, signal } from "@angular/core";
import { CanvasService } from "./canvas.service";
import { CanvasStore } from "./stores/canvas.store.service";
import { ArrayService } from "./arrays.service";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";
import { LoadingService } from "./loading.service";
import { CustomError } from "../models/CustomError";
import { Kmeans } from "../library/kmeans";
import { KmeansMessageType, KmeansWorkerMessage } from "../kmeans.worker";
import { KmeansArgs } from "../models/Kmeans";

@Injectable({
  providedIn: 'root'
})
export class KmeansImageService {
  readonly COLOR_LAYER_LABEL = "Color Layer {}";
  readonly IMAGE_MASK_LABEL = "Image Mask {}";
  readonly kmeans: Kmeans;

  constructor(
    private canvasService: CanvasService,
    private canvasStore: CanvasStore,
    private arrayService: ArrayService,
    private loadingService: LoadingService,
    private processedImageStore: ProcessedImageStore,
  ) {
    this.kmeans = new Kmeans(this.loadingService.update.bind(this.loadingService))
  }
  
  generateKmeansImages(image: HTMLImageElement, clusters: number, iterations: number, maskValue: number | null) {
    var context2D = this.canvasStore.context2D();
    if (context2D == null) {
      throw new CustomError("No context")
    }
    var imageData = this.canvasService.getImageDataFromImage(context2D, image);
    var initialCentroids = this.processedImageStore.initialCentroids().map(centroid => centroid());
    this.createKmeansImages(imageData, clusters, iterations, initialCentroids, maskValue).subscribe(() => {
      var context2D = this.canvasStore.context2D();
      if (context2D == null) {
        throw new CustomError("No context")
      }
      this.loadKmeansImages(context2D, this.processedImageStore).subscribe(this.imagesDoneProcessing.bind(this));
    });
  }

  imagesDoneProcessing() {
    var processedImage = this.processedImageStore.getProcessedImage();
    if (processedImage == undefined) {
      throw new CustomError("No processed image")
    }
    this.canvasStore.displayedImage.set(processedImage);
  }

  private createKmeansImages(imageData: ImageData, clusters: number, iterations: number, initialCentroids: Pixel[] | null, maskValue: number | null): Observable<void> {
    return new Observable((subscriber) => {
      var pixels = this.canvasService.imageDataToPixels(imageData)
      if (typeof Worker !== 'undefined') {
        this.createKmeansImagesAsync(pixels, clusters, iterations, initialCentroids, maskValue, subscriber);
        return;
      }
      this.createKmeansImagesSync(pixels, clusters, iterations, initialCentroids, maskValue, subscriber);
    })
  }

  private createKmeansImagesAsync(pixels: Pixel[], clusters: number, iterations: number, initialCentroids: Pixel[] | null, maskValue: number | null, subscriber: Subscriber<void>) {
    var kmeansWorker = new Worker(new URL('../kmeans.worker', import.meta.url));
    kmeansWorker.onmessage = this.receiveKmeansMessage.bind(this, pixels, maskValue, subscriber);
    var args: KmeansArgs = { 
      data: pixels, 
      clusters, 
      epochs: iterations, 
      initialCentroids,
    }
    kmeansWorker.postMessage(args);
  }

  private createKmeansImagesSync(pixels: Pixel[], clusters: number, iterations: number, initialCentroids: Pixel[] | null, maskValue: number | null, subscriber: Subscriber<void>) {
    var { labels, labeledData, centroids } = this.kmeans.kmeans(pixels, clusters, iterations, initialCentroids);
    this.processKmeansDataToImages(pixels, labels, labeledData, centroids as Pixel[], maskValue);
    subscriber.next();
    subscriber.complete();
  }

  private receiveKmeansMessage(pixels: Pixel[], maskValue: number | null, subscriber: Subscriber<void>, message: MessageEvent<KmeansWorkerMessage>) {
    if (message.data.type == KmeansMessageType.UPDATE) {
      return;
    }
    var { labels, labeledData, centroids } = message.data.response;
    this.processKmeansDataToImages(pixels, labels, labeledData, centroids as Pixel[], maskValue);
    subscriber.next();
    subscriber.complete();
  }

  private processKmeansDataToImages(pixels: Pixel[], labels: Set<number>, labeledColors: number[], centroids: Pixel[], maskValue: number | null) {
    var processedImageStore = this.processedImageStore.initializeForProcessing(centroids as Pixel[], labels)
    this.loadingService.update({ message: "Generating Color Layers", progress: 0 });
    var imageLabelDisplayInfos: ImageDisplayInfo[] = processedImageStore.processedImages();
    
    for (let label = 0; label < labels.size; label++) {
      var labelMask = this.kmeans.createMask(labeledColors, label, maskValue)
      var { labelColor, colorLayer, imageMask } = this.createColorLayer(pixels, labelMask, label)
      processedImageStore.labelColors.set(label, labelColor)
      imageLabelDisplayInfos.push({
        displayLabel: this.getLabelForImageSelection(this.COLOR_LAYER_LABEL, label, null),
        label: label, 
        pixels: colorLayer,
        image: signal<HTMLImageElement | null>(null),
        loading: signal(false),
        group: "Color Layers",
      });
      imageLabelDisplayInfos.push({ 
        displayLabel: this.getLabelForImageSelection(this.IMAGE_MASK_LABEL, label, null),
        label: label, 
        pixels: imageMask,
        image: signal<HTMLImageElement | null>(null),
        loading: signal(false),
        group: "Image Masks",
      });
      this.loadingService.update({ message: `Generated Color Layer ${label + 1}`, progress: (label + 1) / labels.size });
    }
    var processedImagePixels = labeledColors.map(label => processedImageStore.labelColors.get(label)!)
    imageLabelDisplayInfos.splice(1, 0, processedImageStore.getNewProcessedImage(processedImagePixels));
    processedImageStore.processedImages.set([...imageLabelDisplayInfos]);
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: (number | null)[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var imageMask = colorLabels.map((label, i) => label === targetLabel ? pixels[i] : emptyPixel);
    var labelColor = this.getAveragePixel(imageMask, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? labelColor : emptyPixel);
    return { labelColor, colorLayer, imageMask }
  }

  private loadKmeansImages(context: CanvasRenderingContext2D, processedImageStore: ProcessedImageStore) {
    var loadingCount = 0;
    return new Observable<void>((subscriber) => {
      // Create the processed images ImageDisplayInfo
      var imageObservables = processedImageStore.processedImages()
        .filter(imageDisplayInfo => imageDisplayInfo.image() == null && imageDisplayInfo.pixels != null)
        .map(imageDisplayInfo => this.getImageObservable(context, processedImageStore, imageDisplayInfo));
      forkJoin(imageObservables).subscribe({
        // next: () => {
        //   this.loadingService.update(`Finished processing image data ${loadingCount+1} / ${imageObservables.length}}`);
        //   loadingCount++;
        // },
        complete: () => {
          subscriber.next();
          subscriber.complete();
        }
      })
    })
  }

  private getImageObservable(context: CanvasRenderingContext2D, processedImageStore: ProcessedImageStore, imageDisplayInfo: ImageDisplayInfo): Observable<void> {
    var pixels2D = this.pixelsTo2D(processedImageStore, imageDisplayInfo.pixels);
    imageDisplayInfo.loading.set(true);
    return new Observable(subscriber => {
      this.canvasService.createImageFromPixels(context, pixels2D).subscribe(image => {
        imageDisplayInfo.image.set(image);
        imageDisplayInfo.loading.set(false);
        subscriber.next();
        subscriber.complete();
      })
    })
  }

  private getAveragePixel(pixels: Pixel[], ignoreValue: Pixel, ignoreAlpha = true): Pixel {
    var notIgnoredPixels = 0;
    var averagePixel = pixels.reduce((sum, curPixel, i) => {
      if (curPixel != ignoreValue) {
        notIgnoredPixels++;
        return sum.add(curPixel) as Pixel;
      }
      return sum;
    }).divide(notIgnoredPixels) as Pixel;
    if (ignoreAlpha) {
      averagePixel.a = 255;
    }
    return averagePixel;
  }  

  getLabelForImageSelection(formatString: string, label: number, image: HTMLImageElement | null) {
    return formatString.replace("{}", label.toString());
  }

  pixelsTo2D(processedImage: ProcessedImageStore,  pixels: Pixel[] | null) {
    if (pixels == null) {
      return [];
    }
    return this.arrayService.to2D(pixels, processedImage.size[0]);
  }

  getRandomInitialCentroids(count: number) {
    var context = this.canvasStore.context2D();
    if (context == null) {
      throw new Error("No context")
    }
    var { imageData } = this.canvasService.getImageData(context)
    var pixels = this.canvasService.imageDataToPixels(imageData)
    return this.kmeans.getRandomInitialCentroids(pixels, count);
  }
}
