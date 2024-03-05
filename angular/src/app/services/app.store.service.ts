import { Injectable, WritableSignal, signal } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { KmeansImage } from "../models/processedImage";

@Injectable({
  providedIn: 'root'
})
export class AppStoreService {
  reset = new Subject<void>();
  
  displayedImage = new BehaviorSubject<HTMLImageElement | null>( null);
  images: Record<string, WritableSignal<HTMLImageElement>> = {};

  kmeansImage = new BehaviorSubject<KmeansImage | null>(null);
  rawImageFile = signal<HTMLImageElement | null>(null);
  rawImageData = signal<ImageData | null>(null);

  rawImageContext2D = new BehaviorSubject<CanvasRenderingContext2D | null>(null);
  kmeansImageContext2D = new BehaviorSubject<CanvasRenderingContext2D | null>(null);
}
