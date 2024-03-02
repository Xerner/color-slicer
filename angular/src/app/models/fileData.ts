export class FileData {
  constructor(
    public file: File, 
    public dataUrl: string,
    public image: HTMLImageElement,
    public rawImageData: ImageData | null,
  ) {}
  // file: File = new File([], "");
  // dataUrl: string = "";
  // image: HTMLImageElement = new Image();
}
