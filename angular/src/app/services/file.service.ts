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
        this.storeService.rawImageFile.set(image);
      })
    };
    fileReader.readAsDataURL(file);
  }

  onReset() {
    this.storeService.rawImageFile.set(null);
  }
}
