import { Injectable } from "@angular/core";
import { FileData } from "../models/fileData";
import { AppService } from "./app.service";
import { ReplaySubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class FileService {
  rawFileData = new ReplaySubject<FileData | null>(0);

  constructor(private appService: AppService) {
    this.appService.reset.subscribe(this.onReset.bind(this));
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      var image = new Image();
      image.onload = () => {
        this.rawFileData.next(new FileData(file, dataUrl, image, null));
      }
      image.src = dataUrl;
    };
    fileReader.readAsDataURL(file);
  }

  onReset() {
    this.rawFileData.next(null);
  }
}
