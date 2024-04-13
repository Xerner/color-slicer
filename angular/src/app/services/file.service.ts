import { Injectable, signal } from "@angular/core";
import { CanvasStore } from "./stores/canvas.store.service";
import { CanvasService } from "./canvas.service";
import { ImageDisplayInfo } from "../models/ImageDisplayInfo";
import { ProcessedImageStore } from "./stores/processed-image.store.service";
import { CentroidSelectorService } from "../components/centroid-selector/centroid-selector.service";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(
    private canvasStore: CanvasStore,
    private canvasService: CanvasService,
    private processedImageStore: ProcessedImageStore,
    private centroidSelectorService: CentroidSelectorService,
  ) {
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.canvasService.createImage(dataUrl).subscribe((image) => {
        if (image == null) {
          throw new Error("Failed to load image");
        }
        var context = this.canvasStore.context2D();
        if (context == null) {
          throw new Error("No context");
        }
        this.canvasStore.rawImage.set(image);
        this.processedImageStore.reset();
        this.canvasService.drawImage(context, image);
        this.centroidSelectorService.initializeInitialCentroids();
        this.processedImageStore.originalImage().image.set(image);
        this.canvasStore.displayedImage.set(this.processedImageStore.originalImage());
      })
    };
    fileReader.readAsDataURL(file);
  }
}
