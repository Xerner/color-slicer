import { Observable, map, merge } from "rxjs";
import { Pixel } from "../models/Pixel";
import { ProcessedImageStore } from "./stores/processed-image.store.service";
import { Injectable } from "@angular/core";
import { KmeansService } from "./kmeans.service";
import { CanvasService } from "./canvas.service";
import { CanvasStore } from "./stores/canvas.store.service";
import { ArrayService } from "./arrays.service";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";
import { LoadingService } from "./loading.service";
import { CustomError } from "../models/CustomError";

@Injectable({
  providedIn: 'root'
})
export class KmeansImageService {
  readonly COLOR_LAYER_LABEL = "Color Layer {}";

  constructor(
    private kmeansService: KmeansService,
    private imageService: CanvasService,
    private arrayService: ArrayService,
    private loadingService: LoadingService,
    private canvasStore: CanvasStore,
    private processedImageStore: ProcessedImageStore,
  ) {}
  
  generateKmeansImages(image: HTMLImageElement, clusters: number, iterations: number, maskValue: number | null) {
    this.processedImageStore.reset();
    var context2D = this.canvasStore.context2D();
    if (context2D == null) {
      throw new CustomError("No context")
    }
    var imageData = this.imageService.getImageDataFromImage(context2D, image);
    var processedImage = this.createKmeansImages(image, imageData, clusters, iterations, maskValue);
    this.loadKmeansImages(context2D, processedImage).subscribe(() => {
      var processedImage = this.processedImageStore.processedImage;
      if (processedImage === undefined) {
        throw new CustomError("Processed image not found");
      }
      this.canvasStore.displayedImage.set(processedImage());
      this.canvasStore.onImageProcessed.next(processedImage());
    });
  }

  private createKmeansImages(image: HTMLImageElement, imageData: ImageData, clusters: number, iterations: number, maskValue: number | null) {
    if (imageData == null) {
      throw new CustomError("No image data")
    }
    var pixels = this.imageService.imageDataToPixels(imageData)
    var { labels, labeledData: labeledColors, centroids } = this.kmeansService.kmeans(pixels, clusters, iterations)
    var processedImage = this.processedImageStore.initialize(image, centroids as Pixel[], labels)
    this.loadingService.update("Generating Color Layers", 0);
    for (let i = 0; i < clusters; i++) {
      var label = labels.has(i) ? i : null;
      if (label == null) {
        processedImage.colorLayers[i] = null;
        continue;
      }
      var labelMask = this.kmeansService.createMask(labeledColors, label, maskValue)
      var { labelColor, colorLayer } = this.createColorLayer(pixels, labelMask, label)
      processedImage.labelColors.set(label, labelColor)
      processedImage.colorLayers[label] = colorLayer
      this.loadingService.update(`Generated Color Layer ${i + 1}`, (i + 1) / clusters);
    }
    processedImage.processedImagePixels = labeledColors.map(label => processedImage.labelColors.get(label)!);
    return processedImage;
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: (number | null)[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var pixelMask = colorLabels.map((label, i) => label === targetLabel ? pixels[i] : emptyPixel);
    var labelColor = this.getAveragePixel(pixelMask, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? labelColor : emptyPixel);
    return { labelColor, colorLayer }
  }

  private loadKmeansImages(context: CanvasRenderingContext2D, processedImageStore: ProcessedImageStore) {
    return new Observable<void>((subscriber) => {
      // Create the processed image
      var processedImagePixels2D = this.arrayService.to2D(processedImageStore.processedImagePixels!, processedImageStore.size[0]);
      var processedObservable = this.imageService.createImageFromPixels(context, processedImagePixels2D)
      // Create the color layers
      var observables = Object.keys(processedImageStore.colorLayers).map((labelstr) => {
        var label = parseInt(labelstr);
        if (processedImageStore.colorLayers[label] == null) {
          return new Observable<ImageDisplayInfo>((subscriber) => {
            subscriber.next({ displayLabel: this.getImageLabel(label, null), label: label, image: null });
            subscriber.complete();
          });
        }
        var colorLayer2D = this.colorLayer2D(processedImageStore, label);
        return this.imageService.createImageFromPixels(context, colorLayer2D).pipe(map(image => ({ displayLabel: this.getImageLabel(label, image), label: label, image })))
      });
      merge(processedObservable, merge(...observables)).subscribe({
        next: (imageAndLabel) => {
          if (imageAndLabel instanceof HTMLImageElement) {
            processedImageStore.processedImage.set({ ...processedImageStore.processedImage(), image: imageAndLabel });
            return;
          }
          processedImageStore.colorLayersImages.update(colorLayersImages => [...colorLayersImages, imageAndLabel!])
        },
        complete: () => {
          processedImageStore.colorLayersImages.update(colorLayers => {
            return colorLayers.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel))
          });
          subscriber.next();
          subscriber.complete();
        }
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

  getImageLabel(label: number, image: HTMLImageElement | null) {
    var displayLabel = this.COLOR_LAYER_LABEL.replace("{}", label.toString());
    if (image == null) {
      displayLabel += " (Empty)"
    }
    return displayLabel;
  }

  colorLayer2D(processedImage: ProcessedImageStore, layerLabel: number) {
    var colorLayer = processedImage.colorLayers[layerLabel];
    if (colorLayer == null) {
      return [];
    }
    return this.arrayService.to2D(colorLayer, processedImage.size[0]);
  }
}
