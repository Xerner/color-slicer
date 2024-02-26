import { Component, ElementRef, ViewChild } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { MatIconModule } from '@angular/material/icon';
import { DisplayImageComponent } from './display-image/display-image.component';

@Component({
  selector: 'app-display-page',
  standalone: true,
  templateUrl: './display-page.component.html',
  imports: [MatIconModule, DisplayImageComponent],
})
export class DisplayPageComponent {
  rawImageDataUrl: string = "";
  displayedImageDataUrl: string = "";
  imageAlt: string = "Image";

  constructor(private imageService: ImageService) { }

  ngAfterViewInit(): void {
    this.reset();
    this.imageService.onImageFileSelected.subscribe(this.onImageSelected.bind(this));
  }

  onImageSelected(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.setImageDataUrl(file, dataUrl);
    };
    fileReader.readAsDataURL(file);
  }

  setImageDataUrl(file: File, dataUrl: string): void {
    this.rawImageDataUrl = dataUrl;
    this.displayedImageDataUrl = dataUrl;
    this.imageAlt = file.name;
  }

  reset() {
    this.rawImageDataUrl = "";
    this.displayedImageDataUrl = "";
  }

  isImageDisplayEmpty(): boolean {
    return this.displayedImageDataUrl == "";
  }
}
