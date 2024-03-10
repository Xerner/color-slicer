import { ImageDisplayInfo } from "./ImageDisplayInfo";
import { FixedArray } from "./fixed-array";
import { Pixel } from "./pixel";

export class ProcessedImage {
  colorLayersImages: ImageDisplayInfo[] = [];
  size: FixedArray<number, 2>;
  processedImage: HTMLImageElement | null = null;
  processedImagePixels: Pixel[] | null = null;
  colorLayers: Record<number, Pixel[] | null> = {};
  labelColors = new Map<number, Pixel>();
  labeledColors: number[] = [];

  constructor(
    /** width, height */
    public originalImage: HTMLImageElement,
    public centroids: Pixel[],
    public labels: Set<number>,
  ) {
    this.size = [originalImage.width, originalImage.height];
  }
}
