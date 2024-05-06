import { DateTime } from 'luxon';
import { ProgressUpdate } from '../models/ProgressUpdate';
import { Vector } from '../models/Vector';
import { KmeansResults } from '../models/Kmeans';

type ignored = null;
const IGNORED = null;

export class Kmeans {
  readonly INITIAL_CENTROID_FIND_ATTEMPTS = 100

  constructor(
    private progressUpdateFunc: (progressUpdate: ProgressUpdate) => void,
  ) { }

  createMask<T>(array: T[], dontMask: T, maskValue: T): T[] {
    var mask = array.map(value => value === dontMask ? value : maskValue);
    return mask
  }

  /**
   * @param clusters number of clusters/centroids to calculate
   * @param epochs number of calculation iterations
   * @param initialCentroids the starting centroids. Bias is largely based around these values
   */
  kmeans(data: Vector[], clusters: number, epochs: number, initialCentroids: Vector[] | null, ignoreValue: Vector | null): KmeansResults {
    var centroids = this.initializeCentroids(data, clusters, initialCentroids, ignoreValue)
    var prevCentroids = [...centroids]
    var distances = this.getDistancesFromCentroids(data, centroids, this.euclideanDistance, ignoreValue)
    var labeledData = this.getLabeledData(distances)

    // Learnin time
    this.progressUpdateFunc({ header: "Generating Kmeans Clusters" });
    this.progressUpdateFunc({ eta: DateTime.now().toISO() });
    for (let i = 0; i < epochs; i++) {
      // We re-calculate our centroids every iteration
      centroids = []
      for (let label = 0; label < clusters; label++) {
        // Re-calculate our centroids by taking the mean of the cluster it belongs to
        var onlyClusterData = data.filter((_, i) => labeledData[i] == label)
        if (onlyClusterData.length == 0) {
          centroids.push(prevCentroids[label])
          console.warn(`Cluster ${label} had no data on epoch ${i}. This means bad centroid initialization, or there are less natural clusters than requested.`)
          continue
        }
        var avgCentroid = onlyClusterData
          .reduce((sum, vector) => sum.add(vector))
          .divide(data.length)
        centroids.push(avgCentroid)
      }
      distances = this.getDistancesFromCentroids(data, centroids, this.euclideanDistance, ignoreValue)
      labeledData = this.getLabeledData(distances)
      this.progressUpdateFunc({ message: `Epoch ${i}`, progress: i / epochs });
    }
    var noIgnoredLabeledData = labeledData.map(label => label === IGNORED ? IGNORED : label)
    var labels = new Set(noIgnoredLabeledData.filter(label => label !== IGNORED) as number[])
    return { labels, labeledData: noIgnoredLabeledData, centroids }
  }

  private initializeCentroids(data: Vector[], clusters: number, initialCentroids: Vector[] | null, ignoreValue: Vector | null) {
    if (initialCentroids == null) {
      return this.getRandomInitialCentroids(data, clusters, ignoreValue);
    }
    if (initialCentroids.length < clusters) {
      var missingCentroidsCount = clusters - initialCentroids.length;
      var missingCentroids = this.getRandomInitialCentroids(data, missingCentroidsCount, ignoreValue);
      initialCentroids.concat(missingCentroids);
    }
    if (initialCentroids.length > clusters) {
      initialCentroids = initialCentroids.slice(0, clusters);
    }
    return initialCentroids;
  }

  getRandomInitialCentroids(data: Vector[], numberOfClusters: number, ignoreValue: Vector | null): Vector[] {
    var centroids = []
    for (let i = 0; i < numberOfClusters; i++) {
      centroids.push(this.getValidInitialCentroid(data, ignoreValue));
    }
    return centroids;
  }

  private getValidInitialCentroid(data: Vector[], ignoreValue: Vector | null): Vector {
    var centroid = data[Math.floor(Math.random() * data.length)];
    for (let i = 0; i < this.INITIAL_CENTROID_FIND_ATTEMPTS; i++) {
      if (ignoreValue !== null && !centroid.equals(ignoreValue)) {
        return centroid
      }
      centroid = data[Math.floor(Math.random() * data.length)];
    }
    return centroid;
  }

  /**
   * @param distanceFunction A function that returns the distance between two data points of type T
   * @returns An array of size data.length x centroids.length containing the distance between each data point and each centroid
   */
  private getDistancesFromCentroids(data: Vector[], centroids: Vector[], distanceFunction: (a: Vector, b: Vector) => number, ignoreValue: Vector | null): (number[] | ignored)[] {
    var distances = data.map(point => {
      return this.shouldIgnore(point, ignoreValue) 
           ? IGNORED
           : centroids.map(centroid => distanceFunction(point, centroid))
    });
    return distances
  }

  private euclideanDistance(points: Vector, centroids: Vector): number {
    return Math.sqrt(points.subtract(centroids).pow(2).sum());
  }

  /**
   * For each grouping of distances from the centroids, returns the index of the smallest distance. 
   * This represents the cluster, or label of the data point
   */
  private getLabeledData(distances: (number[] | ignored)[]): (number | ignored)[] {
    return distances.map(distance => distance == null ? IGNORED : distance.indexOf(Math.min(...distance)));
  }

  private shouldIgnore(data: Vector | ignored, ignoreValue: Vector | ignored): boolean {
    if (ignoreValue === IGNORED || data === IGNORED) {
      return data === IGNORED;
    }
    return data.equals(ignoreValue);
  }
}
