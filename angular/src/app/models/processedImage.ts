import { FixedArray } from "./fixed-array";
import { Pixel } from "./pixel";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";

export interface ImageAndLabel {
  label: string;
  image: HTMLImageElement | null;
}

export class KmeansImage {
  readonly RAW_IMAGE_KEY = 'raw';
  colorLayersImages: ImageAndLabel[] = [];

  constructor(
    /** width, height */
    public size: FixedArray<number, 2>, 
    public centroids: Pixel[],
    public labels: Set<number>,
    public labeledColors: number[],
    public labelColors: Pixel[],
    public colorLayers: Record<string, Pixel[]>,
  ) {
    colorLayers[this.RAW_IMAGE_KEY] = labelColors;
  }

  toImageList(): ImageAndLabel[] {
    var imagesAndLabels: ImageAndLabel[] = [];
    this.colorLayersImages.forEach((imageAndLabel) => {
      if (imageAndLabel.label == this.RAW_IMAGE_KEY) {
        imagesAndLabels.push({ label: "Full Processed Image", image: imageAndLabel.image });
        return;
      }
      var label = `Color Layer ${imageAndLabel.label}`;
      if (imageAndLabel.image == null) {
        label += " (Empty)"
      }
      imagesAndLabels.push({ label: `Color Layer ${imageAndLabel.label}`, image: imageAndLabel.image });
    })
    return imagesAndLabels;
  }

  labeledColors2D() {
    return this.to2D(this.labelColors);
  }

  colorLayer2D(layerLabel: string) {
    return this.to2D(this.colorLayers[layerLabel]);
  }

  private to2D<T>(array: T[]) {
    var width = this.size[0];
    if (array == undefined) {
      return [];
    }
    var newArray: T[][] = [];
    array.forEach((value, i) => {
      if (i % width == 0) {
        newArray.push([])
      }
      newArray[newArray.length - 1].push(value)
    })
    return newArray;
  }
}
