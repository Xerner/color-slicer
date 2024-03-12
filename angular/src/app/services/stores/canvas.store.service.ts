import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";

@Injectable({
  providedIn: 'root'
})
export class CanvasStore {
  context2D = signal<CanvasRenderingContext2D | null>(null);
  
  rawImage = signal<HTMLImageElement | null>(null);
  displayedImage = signal<ImageDisplayInfo | null>(null);
  sliderRawValue = signal<number>(1);
  sliderMultiplier = signal<number>(1);

  onImageProcessed = new Subject<ImageDisplayInfo>();
  onImageLoaded = new Subject<void>();
  onContext2DReady = new Subject<void>();

  reset() {
    this.rawImage.set(null);
    this.displayedImage.set(null);
    this.sliderRawValue.set(1);
    this.sliderMultiplier.set(1);
  }
}
