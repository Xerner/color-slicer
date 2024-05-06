import { Vector } from "./Vector";

// I want this to be a fixed size array, but I can't figure out how to do that
export class Pixel extends Vector {
  //#region Properties

  get r(): number {
    return this[0];
  }

  set r(value: number) {
    this[0] = value;
  }

  get g(): number {
    return this[1];
  }

  set g(value: number) {
    this[1] = value;
  }

  get b(): number {
    return this[2];
  }

  set b(value: number) {
    this[2] = value;
  }

  //#endregion

  constructor(r: number, g: number, b: number) {
    super();
    super.push(r, g, b);
    this._push = super.push;
  }

  toRGBA(alpha: number = 255): PixelRGBA {
    return new PixelRGBA(this.r, this.g, this.b, alpha)
  }

  toArray(): number[] {
    return [this.r, this.g, this.b];
  }

  //#region Overrides

  override push(..._: number[]): number {
    throw new Error("Illegal operation");
  }
  protected _push: (..._: number[]) => void;

  override splice(start: number, deleteCount?: number | undefined): number[];
  override splice(start: number, deleteCount: number, ...items: number[]): number[];
  override splice(start: unknown, deleteCount?: unknown, ...rest: unknown[]): number[] {
    throw new Error("Illegal operation");
  }

  override concat(...items: ConcatArray<number>[]): number[];
  override concat(...items: (number | ConcatArray<number>)[]): number[];
  override concat(...items: unknown[]): number[] {
    throw new Error("Illegal operation");
  }

  override pop(): number | undefined {
    throw new Error("Illegal operation");
  }

  override shift(): number | undefined {
    throw new Error("Illegal operation");
  }

  override reverse(): number[] {
    throw new Error("Illegal operation");
  }

  override sort(compareFn?: ((a: number, b: number) => number) | undefined): this {
    throw new Error("Illegal operation");
  }

  override unshift(...items: number[]): number {
    throw new Error("Illegal operation");
  }

  override toString(): string {
    return `rgba(${this[0]}, ${this[1]}, ${this[2]}, ${this[3]})`;
  }

  //#endregion
}

export class PixelRGBA extends Pixel {
  get a(): number {
    return this[3];
  }

  set a(value: number) {
    this[3] = value;
  }

  constructor(r: number, g: number, b: number, a: number) {
    super(r, g, b);
    this._push(a);
  }

  toRGB(): Pixel {
    return new Pixel(this.r, this.g, this.b)
  }
}
