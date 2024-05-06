/// <reference lib="webworker" />

import { Kmeans } from "./library/kmeans";
import { ProgressUpdate } from "./models/ProgressUpdate";
import { KmeansArgs, KmeansResults } from "./models/Kmeans";
import { Vector } from "./models/Vector";

export const enum KmeansMessageType {
  UPDATE,
  RESULTS
}

export type KmeansWorkerMessage = {
  type: KmeansMessageType.UPDATE;
  response: ProgressUpdate
} | {
  type: KmeansMessageType.RESULTS;
  response: KmeansResults
}

addEventListener('message', startKmeans);

function startKmeans(kmeansMessage: MessageEvent<KmeansArgs>) {
  var { data, clusters, epochs, initialCentroids, ignoreValue } = kmeansMessage.data;
  var vectorData = data.map(vector => Vector.fromArray(vector));
  var vectorInitialCentroids = initialCentroids.map(vector => Vector.fromArray(vector));
  var kmeans = new Kmeans(postUpdate);
  var ignoreValueVector = ignoreValue === null ? null : Vector.fromArray(ignoreValue);
  var kmeansResults = kmeans.kmeans(vectorData, clusters, epochs, vectorInitialCentroids, ignoreValueVector);
  postResults(kmeansResults)
  close();
}

function postUpdate(progressUpdate: ProgressUpdate) {
  postMessage({
    type: KmeansMessageType.UPDATE,
    response: progressUpdate
  })
}

function postResults(kmeansResults: KmeansResults) {
  postMessage({
    type: KmeansMessageType.RESULTS,
    response: kmeansResults
  })
}
