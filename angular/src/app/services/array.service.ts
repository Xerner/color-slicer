import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ArrayService {
  constructor() { }

  replace<T>(array: T[], target: T, replacement: T) {
    return array.forEach((value: T, i: number) => {
      if (value === target) {
        array[i] = replacement;
      }
    });
  }
}