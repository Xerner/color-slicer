import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { ProcessedImage } from "../models/processedImage";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";

@Injectable({
  providedIn: 'root'
})
export class AppStoreService {
  reset = new Subject<void>();
  
  images = signal<ImageDisplayInfo[]>([]);
  rawImage = signal<HTMLImageElement | null>(null);
  processedImage = signal<ProcessedImage | null>(null);
  displayedImage = signal<HTMLImageElement | null>(null);
  
  context2D = signal<CanvasRenderingContext2D | null>(null);

  onImageLoaded = new Subject<void>();
  onContext2DReady = new Subject<void>();
}
