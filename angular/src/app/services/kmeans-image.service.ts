import { first } from "rxjs";
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

  generateKmeansImages(imageData: ImageData, clusters: number, iterations: number, maskValue: number) {
    var kmeansImage = this.createKmeansImage(imageData, clusters, iterations, maskValue);
    var context = this.storeService.rawImageContext2D.getValue();
    if (context == null) {
      throw new Error("No context")
    }
    this.loadKmeansImages(context, kmeansImage);
    kmeansImage.imagesLoaded$.pipe(first()).subscribe(() => {
      this.storeService.kmeansImage.next(kmeansImage);
    });
  }

  loadKmeansImages(context: CanvasRenderingContext2D, kmeansImage: KmeansImage) {
    var { dataUrl } = this.imageService.drawPixels(context, kmeansImage.labeledColors2D());
    this.imageService.createImage(dataUrl).subscribe((image) => {
      kmeansImage.labeledColorsImage.next(image);
    });
    kmeansImage.labels.forEach((label) => {
      var { dataUrl } = this.imageService.drawPixels(context, kmeansImage.colorLayer2D(label.toString()));
      this.imageService.createImage(dataUrl).subscribe((image) => {
        kmeansImage.colorLayersImages[label].next(image);
      });
    });
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
}
