import { Observable, first, map, merge } from "rxjs";
import { FixedArray } from "../models/fixed-array";
import { Pixel } from "../models/pixel";
import { KmeansImage } from "../models/processedImage";
import { Injectable } from "@angular/core";
import { KmeansService } from "./kmeans.service";
import { ImageService } from "./image.service";
import { AppStoreService } from "./app.store.service";
import { subscribe } from "diagnostics_channel";

@Injectable({
  providedIn: 'root'
})
export class KmeansImageService {
  constructor(
    private storeService: AppStoreService,
    private kmeansService: KmeansService,
    private imageService: ImageService,
  ) {}
  
  createKmeansImage(imageData: ImageData, clusters: number, iterations: number, maskValue: number) {
    if (imageData == null) {
      throw new Error("No image data")
    }
    var shape: FixedArray<number, 2> = [imageData.width, imageData.height]
    var pixels = this.imageService.imageDataToPixels(imageData)
    var { labels, labeledData: labeledColors, centroids } = this.kmeansService.kmeans(pixels, clusters, iterations)
    var kmeansImage = new KmeansImage(shape, centroids as Pixel[], labels, labeledColors, [], {})
    labels.forEach((label) => {
      // The offset is sometimes necessary so that we can use certian values, such as 0, as a mask value
      label += 1;
      var labelMask = this.kmeansService.createMask(labeledColors, label, maskValue)
      var { labelColor, colorLayer } = this.createColorLayer(pixels, labelMask, label)
      kmeansImage.labelColors.push(labelColor)
      kmeansImage.colorLayers[label] = colorLayer
    })

    return kmeansImage;
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: number[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var labelColor = this.getAveragePixel(pixels, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? labelColor : emptyPixel);
    return { labelColor, colorLayer }
  }

  generateKmeansImages(image: HTMLImageElement, clusters: number, iterations: number, maskValue: number) {
    var context2D = this.storeService.context2D();
    if (context2D == null) {
      throw new Error("No context")
    }
    this.imageService.drawImage(context2D, image);
    var { imageData } = this.imageService.getImageData(context2D);
    this.resetImages();
    var kmeansImage = this.createKmeansImage(imageData, clusters, iterations, maskValue);
    this.loadKmeansImages(context2D, kmeansImage);
  }

  loadKmeansImages(context: CanvasRenderingContext2D, processedImage: KmeansImage) {
    var observables = Object.keys(processedImage.colorLayers).map((label) => {
      var { dataUrl } = this.imageService.drawPixels(context, processedImage.colorLayer2D(label));
      return this.imageService.createImage(dataUrl).pipe(map(image => ({ label: label.toString(), image })))
    });
    merge(...observables).subscribe({
      next: (imageAndLabel) => {
        processedImage.colorLayersImages.push(imageAndLabel)
      },
      complete: () => {
        this.storeService.processedImage.set(processedImage);
        var imageList = processedImage.toImageList().sort((a, b) => a.label.localeCompare(b.label));
        this.storeService.images.set(imageList)
      }
    })
  }

  getAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var averagePixel = pixels.reduce((curPixel, prevPixel, i) => {
      if (curPixel != ignoreValue) {
        return prevPixel.add(curPixel) as Pixel;
      }
      return prevPixel;
    }).divide(pixels.length) as Pixel;
    return averagePixel;
  }  

  resetImages() {
    this.storeService.processedImage.set(null);
    this.storeService.displayedImage.set(null);
    this.storeService.images.set([]);
  }
}
