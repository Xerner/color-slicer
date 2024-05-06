import { ProgressUpdateFunc } from "./ProgressUpdate";
import { Vector } from "./Vector";

export interface KmeansArgs {
  data: number[][];
  clusters: number;
  epochs: number;
  initialCentroids: number[][];
  ignoreValue: number[] | null;
}

export interface KmeansResults {
  labels: Set<number>;
  labeledData: (number | null)[];
  centroids: Vector[];
}
