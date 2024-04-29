import { ProgressUpdateFunc } from "./ProgressUpdate";
import { Vector } from "./Vector";

export interface KmeansArgs {
  data: Vector[];
  clusters: number;
  epochs: number;
  initialCentroids: Vector[] | null;
}

export interface KmeansResults {
  labels: Set<number>;
  labeledData: number[];
  centroids: Vector[];
}
