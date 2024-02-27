import { Injectable } from '@angular/core';
import { Pixel } from '../models/pixel';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private appService: AppService) { }

  updateImageData(image: HTMLImageElement, canvas: HTMLCanvasElement): Pixel[] {
    if (canvas == undefined) {
      console.log("Canvas is undefined");
      return [];
    }
    var context = canvas.getContext('2d')!;
    this.updateCanvasImage(image, canvas)
    var imageData: ImageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var pixels = this.imageDataToPixels(imageData);
    this.appService.imageData.set(imageData);
    this.appService.rawPixels.set(pixels);
    return pixels;
  }

  private updateCanvasImage(image: HTMLImageElement, canvas: HTMLCanvasElement) {
    this.clearContext(canvas);
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext('2d')!;
    context.drawImage(image, 0, 0, image.width, image.height);
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

  private clearContext(canvas: HTMLCanvasElement) {
    var context = canvas.getContext('2d')!;
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  getOutputFilename(filename: string, index: number) {
    return `${filename}_layer_${index}.png`;
  }

  getAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var averagePixel = pixels.reduce((curPixel, prevPixel, i) => {
      if (curPixel != ignoreValue) {
        return prevPixel.add(curPixel);
      } else {
        return prevPixel;
      }
    }).divide(pixels.length);
    return averagePixel
  }
}
