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
  
  initialCentroids = signal<WritableSignal<Pixel>[]>([]);
  centroids: Pixel[] = [];
  labels: Set<number> = new Set();
  labelColors = new Map<number, Pixel>();
  labeledColors: number[] = [];

  size: FixedArray<number, 2> = [0, 0];
  originalImage = signal<ImageDisplayInfo>({
    group: "Full Images",
    displayLabel: "Original Image",
    image: signal(null),
    loading: signal(false),
    label: null,
    pixels: null
  });
  processedImage = signal<ImageDisplayInfo>({
    group: "Full Images",
    displayLabel: "Processed Image",
    image: signal(null),
    loading: signal(false),
    label: null,
    pixels: null
  });
  processedImages = signal<ImageDisplayInfo[]>([]);
  
  initialize(originalImage: HTMLImageElement, centroids: Pixel[], labels: Set<number>) {
    this.originalImage().image.set(originalImage);
    this.centroids = centroids;
    this.labels = labels;
    this.size = [originalImage.width, originalImage.height];
    return this;
  }

  reset() {
    this.originalImage().image.set(null);
    this.processedImage().image.set(null);
    this.processedImages.set([]);
    //this.processedImagePixels = null;
    this.centroids = [];
    this.labels.clear();
    this.size = [0, 0];
    //this.colorLayers = {};
    this.labelColors.clear();
    this.labeledColors = [];
  }
}
