import { Injectable } from "@angular/core";
import { AppStoreService } from "./app.store.service";
import { ImageService } from "./image.service";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  constructor(
    private storeService: AppStoreService,
    private imageService: ImageService,
  ) {
    this.storeService.reset.subscribe(this.onReset.bind(this));
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.imageService.createImage(dataUrl).subscribe((image) => {
        this.storeService.rawImage.set(image);
        this.storeService.displayedImage.set(image);
        this.storeService.onImageLoaded.next();
      })
    };
    fileReader.readAsDataURL(file);
  }

  onReset() {
    this.storeService.rawImage.set(null);
  }
}
