import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";
import { FixedArray } from "../../models/FixedArray";
import { Pixel } from "../../models/Pixel";
import { Injectable, WritableSignal, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ProcessedImageStore {
  readonly ORIGINAL_IMAGE_LABEL = "Original Image"
  readonly PROCESSED_IMAGE_LABEL = "Processed Image"
  readonly INITIAL_CENTROID_COUNT = 4;
  
  getOriginalImage(): ImageDisplayInfo | undefined {
    return this.processedImages().find((imageDisplayInfo) => imageDisplayInfo.displayLabel === this.ORIGINAL_IMAGE_LABEL);
  }

  getProcessedImage(): ImageDisplayInfo | undefined {
    return this.processedImages().find((imageDisplayInfo) => imageDisplayInfo.displayLabel === this.PROCESSED_IMAGE_LABEL);
  }

  getNewOriginalImage(image: HTMLImageElement): ImageDisplayInfo {
    return {
      group: "Full Images",
      displayLabel: "Original Image",
      image: signal(image),
      loading: signal(false),
      label: null,
      pixels: null
    }
  }

  getNewProcessedImage(pixels: Pixel[]): ImageDisplayInfo {
    return {
      group: "Full Images",
      displayLabel: "Processed Image",
      image: signal(null),
      loading: signal(false),
      label: null,
      pixels: pixels
    }
  }

  initialCentroids = signal<WritableSignal<Pixel>[]>([]);
  centroids: Pixel[] = [];
  labels: Set<number> = new Set();
  labelColors = new Map<number | null, Pixel>();
  labeledColors: number[] = [];

  size: FixedArray<number, 2> = [0, 0];
  processedImages = signal<ImageDisplayInfo[]>([]);
  
  initializeForProcessing(centroids: Pixel[], labels: Set<number>) {
    var originalImageInfo = this.getOriginalImage();
    if (originalImageInfo == undefined) {
      throw new Error("No original image");
    }
    var originalImage = originalImageInfo.image();
    if (originalImage == null) {
      throw new Error("No original image data");
    }
    this.processedImages.set(this.processedImages().filter(image => image == originalImageInfo));
    this.centroids = centroids;
    this.labels = labels;
    this.size = [originalImage.width, originalImage.height];
    this.labelColors.clear();
    this.labeledColors = [];
    return this;
  }

  reset() {
    this.processedImages.set([]);
    this.centroids = [];
    this.labels.clear();
    this.size = [0, 0];
    this.labelColors.clear();
    this.labeledColors = [];
  }
}
