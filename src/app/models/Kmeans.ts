import { ProgressUpdateFunc } from "./ProgressUpdate";
import { Vector } from "./Vector";

export interface KmeansArgs {
  data: Vector[];
  clusters: number;
  epochs: number;
  initialCentroids: Vector[];
  ignoreValue: Vector | null;
}

export interface KmeansResults {
  labels: Set<number>;
  labeledData: (number | null)[];
  centroids: Vector[];
}
