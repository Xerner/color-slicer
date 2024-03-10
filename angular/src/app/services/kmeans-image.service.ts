import { Observable, map, merge } from "rxjs";
import { Pixel } from "../models/pixel";
import { ProcessedImage } from "../models/processedImage";
import { Injectable } from "@angular/core";
import { KmeansService } from "./kmeans.service";
import { ImageService } from "./image.service";
import { AppStoreService } from "./app.store.service";
import { ArrayService } from "./arrays.service";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";

@Injectable({
  providedIn: 'root'
})
export class KmeansImageService {
  readonly ORIGINAL_IMAGE_LABEL = "Original Image"
  readonly ALL_LAYERS_LABEL = "Processed Image"
  readonly COLOR_LAYER_LABEL = "Color Layer {}";

  constructor(
    private storeService: AppStoreService,
    private kmeansService: KmeansService,
    private imageService: ImageService,
    private arrayService: ArrayService,
  ) {}
  
  generateKmeansImages(image: HTMLImageElement, clusters: number, iterations: number, maskValue: number | null) {
    var context2D = this.storeService.context2D();
    if (context2D == null) {
      throw new Error("No context")
    }
    var imageData = this.imageService.getImageDataFromImage(context2D, image);
    var kmeansImage = this.createKmeansImages(image, imageData, clusters, iterations, maskValue);
    this.loadKmeansImages(context2D, kmeansImage);
  }

  private createKmeansImages(image: HTMLImageElement, imageData: ImageData, clusters: number, iterations: number, maskValue: number | null) {
    if (imageData == null) {
      throw new Error("No image data")
    }
    var pixels = this.imageService.imageDataToPixels(imageData)
    var { labels, labeledData: labeledColors, centroids } = this.kmeansService.kmeans(pixels, clusters, iterations)
    var processedImage = new ProcessedImage(image, centroids as Pixel[], labels)
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
    }
    processedImage.processedImagePixels = labeledColors.map(label => processedImage.labelColors.get(label)!);
    return processedImage;
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: (number | null)[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var labelColor = this.getAveragePixel(pixels, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? labelColor : emptyPixel);
    return { labelColor, colorLayer }
  }

  private loadKmeansImages(context: CanvasRenderingContext2D, processedImage: ProcessedImage) {
    // Create the processed image
    var processedImagePixels2D = this.arrayService.to2D(processedImage.processedImagePixels!, processedImage.size[0]);
    var processedObservable = this.imageService.createImageFromPixels(context, processedImagePixels2D)
    // Create the color layers
    var observables = Object.keys(processedImage.colorLayers).map((labelstr) => {
      var label = parseInt(labelstr);
      if (processedImage.colorLayers[label] == null) {
        return new Observable<ImageDisplayInfo>((subscriber) => {
          subscriber.next({ displayLabel: label.toString(), label: label, image: null });
          subscriber.complete();
        });
      }
      var colorLayer2D = this.colorLayer2D(processedImage, label);
      return this.imageService.createImageFromPixels(context, colorLayer2D).pipe(map(image => ({ displayLabel: label.toString(), label: label, image })))
    });
    merge(processedObservable, merge(...observables)).subscribe({
      next: (imageAndLabel) => {
        if (imageAndLabel instanceof HTMLImageElement) {
          processedImage.processedImage = imageAndLabel;
          return;
        }
        processedImage.colorLayersImages.push(imageAndLabel!)
      },
      complete: () => {
        this.storeService.processedImage.set(processedImage);
        var imageList = this.toImageList(processedImage) //.sort((a, b) => a.label.localeCompare(b.label));
        this.storeService.images.set(imageList)
      }
    })
  }

  private getAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var averagePixel = pixels.reduce((curPixel, prevPixel, i) => {
      if (curPixel != ignoreValue) {
        return prevPixel.add(curPixel) as Pixel;
      }
      return prevPixel;
    }).divide(pixels.length) as Pixel;
    return averagePixel;
  }  

  toImageList(processedImage: ProcessedImage): ImageDisplayInfo[] {
    var imagesAndLabels: ImageDisplayInfo[] = [];
    processedImage.colorLayersImages.forEach((imageAndLabel) => {
      var label = this.COLOR_LAYER_LABEL.replace("{}", imageAndLabel.displayLabel);
      if (imageAndLabel.image == null) {
        label += " (Empty)"
      }
      imagesAndLabels.push({ displayLabel: label, label: imageAndLabel.label, image: imageAndLabel.image });
    })
    imagesAndLabels.sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
    imagesAndLabels.unshift({ displayLabel: this.ALL_LAYERS_LABEL, label: null, image: processedImage.processedImage });
    imagesAndLabels.unshift({ displayLabel: this.ORIGINAL_IMAGE_LABEL, label: null, image: processedImage.originalImage });
    return imagesAndLabels;
  }

  // labeledColors2D() {
  //   return this.to2D(this.labeledColors);
  // }

  colorLayer2D(processedImage: ProcessedImage, layerLabel: number) {
    var colorLayer = processedImage.colorLayers[layerLabel];
    if (colorLayer == null) {
      return [];
    }
    return this.arrayService.to2D(colorLayer, processedImage.size[0]);
  }
}
