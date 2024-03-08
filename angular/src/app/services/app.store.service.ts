import { Injectable, WritableSignal, signal } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { ImageAndLabel, KmeansImage } from "../models/processedImage";

@Injectable({
  providedIn: 'root'
})
export class AppStoreService {
  reset = new Subject<void>();
  
  images = signal<ImageAndLabel[]>([]);
  rawImage = signal<HTMLImageElement | null>(null);
  processedImage = signal<KmeansImage | null>(null);
  displayedImage = signal<HTMLImageElement | null>(null);
  
  context2D = signal<CanvasRenderingContext2D | null>(null);

  onImageLoaded = new Subject<void>();
  onContext2DReady = new Subject<void>();
}
