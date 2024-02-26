
export class Pixel {
  constructor(public r: number,public g: number,public b: number,public a: number) { }

  add(pixel: Pixel) {
    return new Pixel(
      this.r + pixel.r,
      this.g + pixel.g, 
      this.b + pixel.b,
      this.a + pixel.a
    );
  }

  divide(divisor: number) {
    return new Pixel(
      this.r / divisor,
      this.g / divisor,
      this.b / divisor,
      this.a / divisor
    );
  }
}
