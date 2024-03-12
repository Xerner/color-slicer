import { Vector } from "./Vector";

// I want this to be a fixed size array, but I can't figure out how to do that
export class Pixel extends Vector {
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

  get a(): number {
    return this[3];
  }

  set a(value: number) {
    this[3] = value;
  }

  constructor(r: number, g: number, b: number, a: number) {
    super();
    super.push(r, g, b, a);
  }

  override push(..._: number[]): number {
    throw new Error("Illegal operation");
  }

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
}
