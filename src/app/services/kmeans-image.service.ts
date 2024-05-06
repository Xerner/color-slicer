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
import { ProgressUpdate } from "../models/ProgressUpdate";
import { DateObjectUnits, DateTime } from "luxon";
import { Vector } from "../models/Vector";

export const IGNORE_PIXEL = new Pixel(0, 0, 0);

@Injectable({
  providedIn: 'root'
})
export class KmeansImageService {
  readonly COLOR_LAYER_LABEL = "Color Layer {}";
  readonly IMAGE_MASK_LABEL = "Image Mask {}";
  readonly kmeans: Kmeans;
  private kmeansWorker: Worker | null = null;

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
    this.loadingService.start();
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

  private createKmeansImages(imageData: ImageData, clusters: number, iterations: number, initialCentroids: Pixel[], maskValue: number | null): Observable<void> {
    return new Observable((subscriber) => {
      var pixels = this.canvasService.imageDataToPixels(imageData)
      if (typeof Worker !== 'undefined') {
        this.createKmeansImagesAsync(pixels, clusters, iterations, initialCentroids, maskValue, subscriber);
        return;
      }
      this.createKmeansImagesSync(pixels, clusters, iterations, initialCentroids, maskValue, subscriber);
    })
  }

  private createKmeansImagesAsync(pixels: Pixel[], clusters: number, iterations: number, initialCentroids: Pixel[], maskValue: number | null, subscriber: Subscriber<void>) {
    this.kmeansWorker = new Worker(new URL('../kmeans.worker', import.meta.url));
    this.kmeansWorker.onmessage = this.receiveKmeansMessage.bind(this, pixels, maskValue, subscriber);
    var args: KmeansArgs = { 
      data: pixels.map(pixel => pixel.toArray()), 
      clusters, 
      epochs: iterations, 
      initialCentroids: initialCentroids.map(pixel => pixel.toArray()),
      ignoreValue: IGNORE_PIXEL.toArray()
    }
    this.kmeansWorker.postMessage(args);
  }

  private createKmeansImagesSync(pixels: Pixel[], clusters: number, iterations: number, initialCentroids: Pixel[] | null, maskValue: number | null, subscriber: Subscriber<void>) {
    var { labels, labeledData, centroids } = this.kmeans.kmeans(pixels, clusters, iterations, initialCentroids, IGNORE_PIXEL);
    this.processKmeansDataToImages(pixels, labels, labeledData, centroids as Pixel[], maskValue);
    subscriber.next();
    subscriber.complete();
  }

  private receiveKmeansMessage(pixels: Pixel[], maskValue: number | null, subscriber: Subscriber<void>, message: MessageEvent<KmeansWorkerMessage>) {
    if (message.data.type == KmeansMessageType.UPDATE) {
      var kmeansUpdate: ProgressUpdate = {
        header: message.data.response.header,
        message: message.data.response.message,
        progress: message.data.response.progress,
        eta: message.data.response.eta,
      };
      this.loadingService.update(kmeansUpdate);
      return;
    }
    var { labels, labeledData, centroids } = message.data.response;
    this.processKmeansDataToImages(pixels, labels, labeledData, centroids as Pixel[], maskValue);
    subscriber.next();
    subscriber.complete();
  }

  private processKmeansDataToImages(pixels: Pixel[], labels: Set<number>, labeledColors: (number | null)[], centroids: Pixel[], maskValue: number | null) {
    var processedImageStore = this.processedImageStore.initializeForProcessing(centroids as Pixel[], labels)
    this.loadingService.update({ message: "Generating Color Layers", progress: 0 });
    var imageLabelDisplayInfos: ImageDisplayInfo[] = processedImageStore.processedImages();
    
    processedImageStore.labelColors.set(null, IGNORE_PIXEL)
    var labelsArr = this.getContiguousLabels(labels, centroids);
    for (let i = 0; i < labelsArr.length; i++) {
      var label = labelsArr[i];
      var labelMask = this.kmeans.createMask(labeledColors, label, maskValue)
      var { labelColor, colorLayer, imageMask } = this.createColorLayer(pixels, labelMask, label)
      if (labelColor !== null) {
        processedImageStore.labelColors.set(label, labelColor)
      }
      imageLabelDisplayInfos.push({
        displayLabel: this.getLabelForImageSelection(this.COLOR_LAYER_LABEL, i),
        label: label, 
        pixels: label !== null ? colorLayer : null,
        image: signal<HTMLImageElement | null>(null),
        loading: signal(false),
        group: "Color Layers",
      });
      imageLabelDisplayInfos.push({ 
        displayLabel: this.getLabelForImageSelection(this.IMAGE_MASK_LABEL, i),
        label: label, 
        pixels: label !== null ? imageMask : null,
        image: signal<HTMLImageElement | null>(null),
        loading: signal(false),
        group: "Image Masks",
      });
      this.loadingService.update({ message: `Generated Color Layer ${i + 1}`, progress: (i + 1) / labelsArr.length });
    }
    var processedImagePixels = labeledColors.map(label => processedImageStore.labelColors.get(label)!)
    imageLabelDisplayInfos.splice(1, 0, processedImageStore.getNewProcessedImage(processedImagePixels));
    processedImageStore.processedImages.set([...imageLabelDisplayInfos]);
  }

  private getContiguousLabels(labels: Set<number>, centroids: Pixel[]): (number | null)[] {
    var labelsArr = new Array(centroids.length).fill(null).map((label, i) => {
      return labels.has(i) ? i : null;
    });
    return labelsArr;
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: (number | null)[], targetLabel: number | null, emptyPixel = IGNORE_PIXEL) {
    if (targetLabel === null) {
      return { labelColor: null, colorLayer: null, imageMask: null };
    }
    var imageMask = colorLabels.map((label, i) => label === targetLabel ? pixels[i] : emptyPixel);
    var labelColor = this.getAveragePixel(imageMask, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? labelColor : emptyPixel);
    return { labelColor, colorLayer, imageMask };
  }

  private loadKmeansImages(context: CanvasRenderingContext2D, processedImageStore: ProcessedImageStore) {
    var loadingCount = 0;
    return new Observable<void>((subscriber) => {
      // Create the processed images ImageDisplayInfo
      var imageObservables = processedImageStore.processedImages()
        .filter(imageDisplayInfo => imageDisplayInfo.image() == null)
        //.filter(imageDisplayInfo => imageDisplayInfo.image() == null && imageDisplayInfo.pixels != null)
        .map(imageDisplayInfo => this.getImageObservable(context, processedImageStore, imageDisplayInfo));
      forkJoin(imageObservables).subscribe({
        next: () => {
          this.loadingService.update({
            message: `Finished processing image data ${loadingCount+1} / ${imageObservables.length}}`
          });
          loadingCount++;
        },
        complete: () => {
          this.loadingService.finish();
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

  private getAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var notIgnoredPixels = 0;
    var averagePixel = pixels.reduce((sum, curPixel) => {
      if (curPixel != ignoreValue) {
        notIgnoredPixels++;
        return sum.add(curPixel) as Pixel;
      }
      return sum;
    }).divide(notIgnoredPixels) as Pixel;
    return averagePixel;
  }  

  getLabelForImageSelection(formatString: string, label: number) {
    return formatString.replace("{}", (label + 1).toString());
  }

  pixelsTo2D(processedImage: ProcessedImageStore,  pixels: Pixel[] | null) {
    if (pixels == null) {
      return [];
    }
    return this.arrayService.to2D(pixels, processedImage.size[0]);
  }

  getRandomInitialCentroids(count: number, ignoreValue: Vector | null) {
    var context = this.canvasStore.context2D();
    if (context == null) {
      throw new Error("No context")
    }
    var { imageData } = this.canvasService.getImageData(context)
    var pixels = this.canvasService.imageDataToPixels(imageData)
    return this.kmeans.getRandomInitialCentroids(pixels, count, ignoreValue);
  }

  reset() {
    this.processedImageStore.reset();
    this.kmeansWorker?.terminate();
  }
}
