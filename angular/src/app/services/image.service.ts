import { Injectable } from '@angular/core';
import { Pixel } from '../models/pixel';
import { Observable, combineLatest, filter, fromEvent } from 'rxjs';
import { KmeansService } from './kmeans.service';
import { AppStoreService } from './app.store.service';
import { ProcessedImage } from '../models/processedImage';
import { FixedArray } from '../models/fixed-array';
import { ArrayService } from './arrays.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  readonly IDENTITY_TRANSFORM = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  constructor(
    private storeService: AppStoreService,
    private kmeansService: KmeansService,
    private arrayService: ArrayService,
    ) {
    combineLatest([
      this.storeService.onContext2DReady.pipe(filter((context) => context != null)),
      this.storeService.onImageLoaded.pipe(filter((image) => image != null)), 
    ]).subscribe((args) => {
      const [context, image] = args;
      this.updateCanvasImage(context!, image!);
    });
  }

  useCanvas<T>(context: CanvasRenderingContext2D, callback: (context: CanvasRenderingContext2D) => T): T {
    var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var currentTransform = this.resizeCanvasToIdentity(context)
    var returnObj = callback(context);
    context.setTransform(currentTransform);
    context.putImageData(imageData, 0, 0);
    return returnObj;
  }
  
  createImageFromPixels(context: CanvasRenderingContext2D, pixels: Pixel[][]): Observable<HTMLImageElement | null> {
    return this.useCanvas(context, (context) => {
      var { dataUrl } = this.drawPixels(context, pixels);
      var imageObservable = this.createImage(dataUrl);
      return imageObservable
    });
  }

  getImageData(context: CanvasRenderingContext2D): { imageData: ImageData, dataUrl: string} {
    return this.useCanvas(context, (context) => {
      var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      var dataUrl = context.canvas.toDataURL();
      return { imageData, dataUrl };
    })
  }

  getImageDataFromImage(context2D: CanvasRenderingContext2D, image: HTMLImageElement): ImageData {
    this.drawImage(context2D, image);
    var { imageData } = this.getImageData(context2D);
    this.resetImages();
    return imageData;
  }

  createImage(dataUrl: string): Observable<HTMLImageElement | null> {
    return new Observable((subscriber) => {
      if (dataUrl == "") {
        subscriber.next(null);
        subscriber.complete();
        return;
      }
      var image = new Image();
      image.onload = () => {
        subscriber.next(image);
        subscriber.complete();
      };
      image.src = dataUrl;
    });;
  }

  public updateCanvasImage(context: CanvasRenderingContext2D, image: HTMLImageElement) {
    this.drawImage(context, image);
  }

  public imageDataToPixels(imageData: ImageData): Pixel[] {
    var pixels: Pixel[] = [];
    imageData.data.forEach((_, i) => {
      if (i % 4 == 0) {
        pixels.push(new Pixel(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]));
      }
    })
    return pixels;
  }

  predraw(context: CanvasRenderingContext2D, resizeWidth: number, resizeHeight: number) {
    this.clearContext(context);
    this.resizeCanvas(context, resizeWidth, resizeHeight);
    context.imageSmoothingEnabled = false;
  }
  
  drawImage(context: CanvasRenderingContext2D, image: HTMLImageElement) {
    this.predraw(context, image.width, image.height);
    context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
  }
  
  drawImageData(context: CanvasRenderingContext2D, image: ImageData, width: number, height: number) {
    this.predraw(context, width, height);
    context.putImageData(image, 0, 0);
  }

  drawPixels(context: CanvasRenderingContext2D, pixels: Pixel[][]) {
    var imageData = context.createImageData(context.canvas.width, context.canvas.height);
    if (pixels.length == 0) {
      return { imageData, dataUrl: "" }
    }
    pixels.forEach((pixelRow, i) => {
      pixelRow.forEach((pixel, j) => {
        pixel.forEach((value, k) => {
          var index = (i * pixelRow.length + j) * pixel.length + k;
          imageData.data[index] = value;
        });
      });
    });
    var width = pixels[0].length;
    var height = pixels.length;
    this.predraw(context, width, height);
    var dataUrl = context.canvas.toDataURL();
    context.putImageData(imageData, 0, 0);
    return { imageData, dataUrl }
  }

  clearContext(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  resizeCanvas(context: CanvasRenderingContext2D, width: number, height: number) {
    var transform = context.getTransform();
    context.canvas.width = width * transform.a;
    context.canvas.height = height * transform.d;
  }

  resizeCanvasToIdentity(context: CanvasRenderingContext2D) {
    var transform = context.getTransform();
    context.setTransform(this.IDENTITY_TRANSFORM);
    return transform;
  }

  resetImages() {
    this.storeService.processedImage.set(null);
    this.storeService.displayedImage.set(null);
    this.storeService.images.set([]);
  }
}
