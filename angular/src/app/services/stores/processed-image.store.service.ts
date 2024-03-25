import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";
import { FixedArray } from "../../models/FixedArray";
import { Pixel } from "../../models/Pixel";
import { Injectable, computed, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ProcessedImageStore {
  readonly ORIGINAL_IMAGE_LABEL = "Original Image"
  readonly PROCESSED_IMAGE_LABEL = "Processed Image"
  readonly INITIAL_CENTROID_COUNT = 4;
  
  originalImage = signal<ImageDisplayInfo>({
    displayLabel: "Original Image",
    image: null,
    label: null
  });
  processedImage = signal<ImageDisplayInfo>({
    displayLabel: "Processed Image",
    image: null,
    label: null
  });
  initialCentroids = signal<Pixel[]>([]);
  centroids: Pixel[] = [];
  labels: Set<number> = new Set();
  size: FixedArray<number, 2> = [0, 0];
  processedImagePixels: Pixel[] | null = null;
  colorLayers: Record<number, Pixel[] | null> = {};
  labelColors = new Map<number, Pixel>();
  labeledColors: number[] = [];
  
  colorLayersImages = signal<ImageDisplayInfo[]>([]);

  get allImages() {
    return this.colorLayersImages().concat(this.fullImages());
  }

  fullImages = computed<ImageDisplayInfo[]>(() => {
    return [this.originalImage(), this.processedImage()];
  });

  initialize(originalImage: HTMLImageElement, centroids: Pixel[], labels: Set<number>) {
    this.originalImage.set({ ...this.originalImage(), image: originalImage });
    this.centroids = centroids;
    this.labels = labels;
    this.size = [originalImage.width, originalImage.height];
    return this;
  }

  reset() {
    this.originalImage.set({ ...this.originalImage(), image: null });
    this.processedImage.set({ ...this.processedImage(), image: null });
    this.processedImagePixels = null;
    this.centroids = [];
    this.labels.clear();
    this.size = [0, 0];
    this.colorLayers = {};
    this.labelColors.clear();
    this.labeledColors = [];
    this.colorLayersImages.set([]);
  }
}
