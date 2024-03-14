import { Injectable } from '@angular/core';
import { Vector } from '../models/Vector';
import { LoadingService } from './loading.service';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class KmeansService {
  constructor(
    private loadingService: LoadingService,
  ) { }

  createMask<T>(array: T[], dontMask: T, maskValue: T): T[] {
    var mask = array.map(value => value === dontMask ? value : maskValue);
    return mask
  }

  /**
   * @param clusters number of clusters/centroids to calculate
   * @param epochs number of calculation iterations
   */
  kmeans(data: Vector[], clusters: number, epochs: number, initialCentroids: Vector[] | null = null) {
    var centroids = this.initializeCentroids(data, clusters, initialCentroids)
    var prevCentroids = [...centroids]
    var distances = this.getDistancesFromCentroids(data, centroids, this.euclideanDistance)
    var labeledData = this.getLabeledData(distances)

    // Learnin time
    this.loadingService.updateHeader("Generating Kmeans Clusters");
    this.loadingService.resetTime();
    for (let i = 0; i < epochs; i++) {
      // We re-calculate our centroids every iteration
      centroids = []
      for (let j = 0; j < clusters; j++) {
        // Re-calculate our centroids by taking the mean of the cluster it belongs to
        var onlyClusterData = data.filter((_, i) => labeledData[i] == j)
        if (onlyClusterData.length == 0) {
          centroids.push(prevCentroids[j])
          console.warn(`Cluster ${j} had no data on epoch ${i}. This means bad centroid initialization, or there are less natural clusters than requested.`)
          continue
        }
        var avgCentroid = onlyClusterData
          .reduce((sum, vector) => sum.add(vector))
          .divide(data.length)
        centroids.push(avgCentroid)
      }

      distances = this.getDistancesFromCentroids(data, centroids, this.euclideanDistance)
      labeledData = this.getLabeledData(distances)

      // var timePassed = Math.abs(time.diffNow("milliseconds").milliseconds)
      // this.loadingService.update(`Epoch ${i}, ${timePassed.toFixed(2)} sec`, i / epochs);
      this.loadingService.update(`Epoch ${i}`, i / epochs);
    }
    var labels = new Set(labeledData)
    return { labels, labeledData, centroids }
  }

  private initializeCentroids(data: Vector[], clusters: number, initialCentroids: Vector[] | null) {
    if (initialCentroids == null) {
      return this.getRandomInitialCentroids(data, clusters);
    }
    if (initialCentroids.length < clusters) {
      var missingCentroidsCount = clusters - initialCentroids.length;
      var missingCentroids = this.getRandomInitialCentroids(data, missingCentroidsCount);
      initialCentroids.concat(missingCentroids);
    }
    if (initialCentroids.length > clusters) {
      initialCentroids = initialCentroids.slice(0, clusters);
    }
    return initialCentroids;
  }

  getRandomInitialCentroids(data: Vector[], clusters: number) {
    var xIndexes = new Array(clusters).fill(0).map(_ => Math.floor(Math.random() * data.length))
    var centroids = xIndexes.map(index => data[index]);
    return centroids
  }

  /**
   * @param distanceFunction A function that returns the distance between two data points of type T
   * @returns An array of size data.length x centroids.length containing the distance between each data point and each centroid
   */
  private getDistancesFromCentroids(data: Vector[], centroids: Vector[], distanceFunction: (a: Vector, b: Vector) => number): number[][] {
    var distances = data.map(point => centroids.map(centroid => distanceFunction(point, centroid)));
    return distances
  }

  private euclideanDistance(points: Vector, centroids: Vector): number {
    return Math.sqrt(points.subtract(centroids).pow(2).sum());
  }

  /**
   * For each grouping of distances from the centroids, returns the index of the smallest distance. 
   * This represents the cluster, or label of the data point
   */
  private getLabeledData(distances: number[][]): number[] {
    return distances.map(distance => distance.indexOf(Math.min(...distance)));
  }
}
