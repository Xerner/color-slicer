import { Component, ElementRef, Input, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-display-canvas',
  standalone: true,
  templateUrl: './display-canvas.component.html',
  imports: [MatIconModule],
})
export class DisplayCanvasComponent {
  @Input() src: string = "";
  @Input() alt: string = "";
  @ViewChild('rawImage') set imageRef(element: ElementRef<HTMLImageElement>) {
    if (element == undefined) {
      return;
    }
    this.image = element.nativeElement;
    this.image.onload = this.getImageData.bind(this);
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

  // _image!: HTMLImageElement;
  // get image() {
  //   if (this._image == undefined) {
  //     this._image = new Image();
  //   }
  //   return this._image;
  // }

  ngOnChanges(changes: SimpleChanges) {
    if (this.image == undefined) {
      return;
    }
    this.image.src = changes['src']?.currentValue;
  }

  isImageDisplayEmpty(): boolean {
    return this.src == "";
  }

  getImageData() {
    if (this.canvas == undefined) {
      console.log("Canvas is undefined");
      return;
    }
    var context = this.canvas.getContext('2d')!;
    this.clearContext(context);
    this.canvas.width = this.image.width;
    this.canvas.height = this.image.height;
    var width = this.image.width;
    var height = this.image.height;
    context.drawImage(this.image, 0, 0, width, height);
    var imgd: ImageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    console.log(imgd);
  }

  clearContext(context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  isFreshImage() {
    return this.image == undefined || this.src == "";
  }
}
