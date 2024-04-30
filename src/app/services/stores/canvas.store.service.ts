import { Injectable, signal } from "@angular/core";
import { Observable, Subject } from "rxjs";
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
  
  areMouseEventsListening = signal<boolean>(false);
  onContext2DReady = new Subject<void>();
}
