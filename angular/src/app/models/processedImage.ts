import { FixedArray } from "./fixed-array";
import { Pixel } from "./pixel";
import { BehaviorSubject, Subject, combineLatest } from "rxjs";

export class KmeansImage {
  labeledColorsImage = new BehaviorSubject<HTMLImageElement | null>(null);
  colorLayersImages: Record<number, BehaviorSubject<HTMLImageElement | null>> = {};
  private imagesLoaded = new Subject<void>();
  imagesLoaded$ = this.imagesLoaded.asObservable();

  constructor(
    /** width, height */
    public size: FixedArray<number, 2>, 
    public centroids: Pixel[],
    public labels: Set<number>,
    public labeledColors: number[],
    public labelColors: Pixel[],
    public colorLayers: Record<string, Pixel[]>,
  ) {
    labels.forEach((label) => {
      this.colorLayersImages[label] = new BehaviorSubject<HTMLImageElement | null>(null);
    })
    combineLatest([
      this.labeledColorsImage, 
      ...Object.values(this.colorLayersImages)
    ]).subscribe((images) => {
      if (images.some((image) => image != null)) {
        this.imagesLoaded.next();
      }
    })
  }

  labeledColors2D() {
    return this.to2D(this.labelColors, this.size[0]);
  }

  colorLayer2D(key: string) {
    return this.to2D(this.colorLayers[key], this.size[0]);
  }

  private to2D<T>(array: T[], width: number) {
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
