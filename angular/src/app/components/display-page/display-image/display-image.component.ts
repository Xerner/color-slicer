import { Component, ElementRef, Input, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-display-image',
  standalone: true,
  templateUrl: './display-image.component.html',
  imports: [MatIconModule],
})
export class DisplayImageComponent {
  @Input() src: string = "";
  @Input() alt: string = "";

  @ViewChild('rawImage') set imageElement(element: ElementRef<HTMLImageElement>) {
    if (element == undefined) {
      return;
    }
    this.image = element.nativeElement;
  }
  image!: HTMLImageElement;

  isImageDisplayEmpty(): boolean {
    return this.src == "";
  }
}
