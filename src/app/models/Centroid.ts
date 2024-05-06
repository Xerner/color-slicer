import { FixedArray } from "./FixedArray";
import { Pixel } from "./Pixel";

export class Centroid {
  pixel: Pixel = new Pixel(0, 0, 0);
  position: FixedArray<number, 2> = [0, 0];
}
