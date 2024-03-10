import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ArrayService {
  to2D<T>(array: T[], width: number) {
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

  swap<T>(array: T[], i: number, j: number) {
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
