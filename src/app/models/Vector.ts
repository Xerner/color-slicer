export class Vector extends Array<number> {
  static fromArray(array: number[]): Vector {
    return new Vector(...array);
  }

  equals(a: Vector): boolean {
    return this.every((value, i) => value === a[i]);
  }

  add(a: Vector): Vector {
    return this.map((value, i) => value + a[i]) as Vector;
  }

  subtract(a: Vector): Vector {
    return this.map((value, i) => value - a[i]) as Vector;
  }

  multiply(a: number): Vector {
    return this.map((value) => value * a) as Vector;
  }

  divide(a: number): Vector {
    return this.map((value) => value / a) as Vector;
  }

  pow(a: number): Vector {
    return this.map((value) => Math.pow(value, a)) as Vector;
  }

  sqrt(): Vector {
    return this.map(value => Math.sqrt(value)) as Vector;
  }

  sum(): number {
    return this.reduce((sum, value) => sum + value, 0);
  }
}
