import { WritableSignal } from "@angular/core";
import { Pixel } from "./Pixel";

export type PixelGroups = 'Full Images' | 'Color Layers' | 'Image Masks';

export interface ImageDisplayInfo {
  displayLabel: string;
  group: PixelGroups;
  label: number | null;
  image: WritableSignal<HTMLImageElement | null>;
  pixels: Pixel[] | null;
  loading: WritableSignal<boolean>;
}
