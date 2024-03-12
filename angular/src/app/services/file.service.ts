import { Injectable } from "@angular/core";
import { CanvasStore } from "./stores/canvas.store.service";
import { CanvasService } from "./canvas.service";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";
import { ProcessedImageStore } from "./stores/processed-image.store.service";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(
    private imageStore: CanvasStore,
    private processedImageStore: ProcessedImageStore,
    private imageService: CanvasService,
  ) {
    this.imageStore.reset.subscribe(this.onReset.bind(this));
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.imageService.createImage(dataUrl).subscribe((image) => {
        this.imageStore.rawImage.set(image);
        var imageDisplayInfo: ImageDisplayInfo = {
          displayLabel: file.name,
          image: image,
          label: null
        }
        this.imageStore.displayedImage.set(imageDisplayInfo);
        this.processedImageStore.reset();
        this.processedImageStore.originalImage.set({ ...this.processedImageStore.originalImage(), image: image });
        this.imageStore.onImageLoaded.next();
      })
    };
    fileReader.readAsDataURL(file);
  }

  onReset() {
    this.imageStore.rawImage.set(null);
  }
}
