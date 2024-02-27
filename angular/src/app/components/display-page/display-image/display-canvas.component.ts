import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AppService } from '../../../services/app.service';
import { ImageService } from '../../../services/image.service';

@Component({
  selector: 'app-display-canvas',
  standalone: true,
  templateUrl: './display-canvas.component.html',
  imports: [MatIconModule],
})
export class DisplayCanvasComponent {
  get src() {
    return this.appService.fileData().dataUrl;
  }
  get alt() {
    return this.appService.fileData().file.name;
  }
  @ViewChild('rawImage') set imageRef(element: ElementRef<HTMLImageElement>) {
    if (element == undefined) {
      return;
    }
    this.image = element.nativeElement;
    this.image.onload = () => this.imageService.updateImageData(this.image, this.canvas);
    this.image.onerror = (error) => console.log("Error loading image", error);
  }
  image!: HTMLImageElement;

  @ViewChild('canvas') set canvasRef(element: ElementRef<HTMLCanvasElement>) {
    if (element == undefined) {
      return;
    }
    this.canvas = element.nativeElement;
  }
  canvas!: HTMLCanvasElement;

  constructor(private appService: AppService, private imageService: ImageService) {}
  
  isImageDisplayEmpty(): boolean {
    return this.src == "";
  }

  isFreshImage() {
    return this.image == undefined || this.src == "";
  }
}
