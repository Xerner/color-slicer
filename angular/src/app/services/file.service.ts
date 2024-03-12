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
    private canvasStore: CanvasStore,
    private canvasService: CanvasService,
    private processedImageStore: ProcessedImageStore,
  ) {
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.canvasService.createImage(dataUrl).subscribe((image) => {
        this.canvasStore.rawImage.set(image);
        var imageDisplayInfo: ImageDisplayInfo = {
          displayLabel: file.name,
          image: image,
          label: null
        }
        this.canvasStore.displayedImage.set(imageDisplayInfo);
        this.processedImageStore.reset();
        this.processedImageStore.originalImage.set({ ...this.processedImageStore.originalImage(), image: image });
        this.canvasStore.onImageLoaded.next();
      })
    };
    fileReader.readAsDataURL(file);
  }
}
