import { Injectable } from '@angular/core';
import { Pixel } from '../models/pixel';
import { AppService } from './app.service';
import { FileData } from '../models/fileData';
import { BehaviorSubject, ReplaySubject, combineLatest, filter } from 'rxjs';
import { FileService } from './file.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  rawImageContext2D = new ReplaySubject<CanvasRenderingContext2D>(0);
  rawImage = new BehaviorSubject<FileData | null>(null);
  readonly IDENTITY_TRANSFORM = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

  constructor(
    private appService: AppService,
    private fileService: FileService,
  ) {
    this.appService.reset.subscribe(this.onReset.bind(this));
    combineLatest([
      this.rawImageContext2D,
      this.fileService.rawFileData.pipe(filter((fileData) => fileData != null)), 
    ]).subscribe((args) => {
      const [context, fileData] = args;
      this.updateImage(context, fileData!);
    });
  }

  public updateImage(context: CanvasRenderingContext2D, fileData: FileData) {
    this.drawImage(context, fileData);
    var imageData: ImageData = this.getImageData(context);
    fileData.rawImageData = imageData;
    this.rawImage.next(fileData);
  }

  private imageDataToPixels(imageData: ImageData): Pixel[] {
    var pixels: Pixel[] = [];
    imageData.data.forEach((_, i) => {
      if (i % 4 == 0) {
        pixels.push(new Pixel(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], imageData.data[i + 3]));
      }
    })
    return pixels;
  }

  getImageData(context: CanvasRenderingContext2D): ImageData {
    var currentImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var currentTransform = context.getTransform();
    context.setTransform(this.IDENTITY_TRANSFORM);
    var unalteredImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    context.setTransform(currentTransform);
    context.putImageData(currentImageData, 0, 0);
    return unalteredImageData;
  }

  drawImage(context: CanvasRenderingContext2D, fileData: FileData) {
    this.clearContext(context);
    this.resizeCanvas(context, fileData);
    context.imageSmoothingEnabled = false;
    context.drawImage(fileData.image, 0, 0, context.canvas.width, context.canvas.height);
  }

  // drawImageData(context: CanvasRenderingContext2D, imageData: ImageData) {
  //   this.clearContext(context);
  //   this.resizeCanvas(context, imageData);
  //   context.putImageData(imageData, 0, 0);
  // }

  clearContext(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  resizeCanvas(context: CanvasRenderingContext2D, image: FileData | ImageData) {
    var transform = context.getTransform();
    if (image instanceof FileData) {
      var width = image.image.width;
      var height = image.image.height;
    }
    else {
      var width = image.width;
      var height = image.height;
    }
    context.canvas.width = width * transform.a;
    context.canvas.height = height * transform.d;
  }

  getOutputFilename(filename: string, index: number) {
    return `${filename}_layer_${index}.png`;
  }

  getAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var averagePixel = pixels.reduce((curPixel, prevPixel, i) => {
      if (curPixel != ignoreValue) {
        return prevPixel.add(curPixel);
      }
      return prevPixel;
    }).divide(pixels.length);
    return averagePixel
  }

  onReset() {
    this.rawImage.next(null);
  }
}
