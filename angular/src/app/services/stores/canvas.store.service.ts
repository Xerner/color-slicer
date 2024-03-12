import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { ImageDisplayInfo } from "../../models/ImageDisplayInfo";

@Injectable({
  providedIn: 'root'
})
export class CanvasStore {
  reset = new Subject<void>();
  fullImages = signal<ImageDisplayInfo[]>([]);

  rawImage = signal<HTMLImageElement | null>(null);
  displayedImage = signal<ImageDisplayInfo | null>(null);
  context2D = signal<CanvasRenderingContext2D | null>(null);
  
  onImageProcessed = new Subject<ImageDisplayInfo>();
  onImageLoaded = new Subject<void>();
  onContext2DReady = new Subject<void>();
}
