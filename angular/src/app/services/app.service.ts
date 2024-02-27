import { Injectable, signal } from "@angular/core";
import { Subject } from "rxjs";
import { Pixel } from "../models/pixel";
import { FileData } from "../models/fileData";

const INITIAL_FILE_DATA = { file: new File([], ""), dataUrl: "" };

@Injectable({
  providedIn: 'root'
})
export class AppService {
  reset = new Subject<void>();
  fileData = signal<FileData>(INITIAL_FILE_DATA);
  imageData = signal<ImageData | null>(null);
  rawPixels = signal<Pixel[]>([]);

  constructor() {
    this.reset.subscribe(this.onReset.bind(this));
  }

  updateFileData(file: File): void {
    var fileReader = new FileReader();
    fileReader.onload = (event) => {
      var dataUrl = event.target?.result as string;
      this.fileData.set({ file: file, dataUrl: dataUrl });
    };
    fileReader.readAsDataURL(file);
  }

  private onReset() {
    this.fileData.set(INITIAL_FILE_DATA);
    this.rawPixels.set([]);
    this.reset.next();
  }
}
