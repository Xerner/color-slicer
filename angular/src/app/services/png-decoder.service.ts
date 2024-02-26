import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class PngDecoderService {
  constructor() { }

  decode(dataUrl: string): void {
    var image = new Image();
    var byteArray = this.toByteArray(dataUrl);
    byteArray.forEach((byte, index) => {

    });
  }

  toByteArray(dataUrl: string): Uint8Array {
    var base64 = dataUrl.split(',')[1];
    var byteArray = new Uint8Array(base64.length);
    for (var b = 0; b < base64.length; b++) {
         byteArray[b] = base64.charCodeAt(b);
    }
    return byteArray;
  }
}
