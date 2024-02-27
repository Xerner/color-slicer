import { Injectable } from '@angular/core';
import { ImageService } from './image.service';
import { Pixel } from '../models/pixel';
import { Vector } from '../models/vector';

@Injectable({
  providedIn: 'root'
})
export class KmeansService {
  constructor(private imageService: ImageService) { }

  generateColorLayersFromImage(pixels: Pixel[], clusters: number, iterations: number, maskValue: number) {
    var { labels } = this.kmeansClusterImage(pixels, clusters, iterations)
    var colorLayers: Pixel[][] = []
    for (let i = 0; i < clusters + 1; i++) {
      // The offset is sometimes necessary so that we can use certian values, such as 0, as a mask value
      var label = labels[i] + 1;
      var labelMask = this.createMask(labels, label, maskValue)
      var colorLayer: Pixel[] = this.createColorLayer(pixels, labelMask, label)
      colorLayers.push(colorLayer)
    }
    return colorLayers
  }

  createMask<T>(array: T[], dontMask: T, maskValue: T): T[] {
    var mask = array.map(value => value === dontMask ? value : maskValue);
    return mask
  }

  // TODO: add methods for swapping out how color replacement happens
  private createColorLayer(pixels: Pixel[], colorLabels: number[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var averagePixel = this.imageService.getAveragePixel(pixels, emptyPixel);
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? averagePixel : emptyPixel);
    return colorLayer
  }

  private kmeansClusterImage(pixels: Pixel[], kClusters: number, iterations: number) {
    // console.log(`Performing K-means clustering with ${kClusters} clusters`)
    var { labels, centroids } = this.kmeans(pixels.map(pixel => pixel.toVector()), kClusters, iterations)
    return { labels, centroids }
  }

  /**
   * @param clusters number of clusters/centroids to calculate
   * @param epochs number of calculation iterations
   */
  kmeans(data: Vector[], clusters: number, epochs: number) {
    // Randomly choose points to be our centroids
    var centroids = this.getInitialCentroids(data, clusters)

    // finding the distance between centroids and all the data points
    var distances = this.getPointDistances(data, centroids, this.euclideanDistance)

    // Centroid with the minimum Distance
    var labels = this.getLabels(distances)

    // Learnin time
    for (let i = 0; i < epochs; i++) {
      console.log(`Epoch ${i}\t ${new Date().getTime().toFixed(2)} sec`)

      // We re-calculate our centroids every iteration
      centroids = []
      for (let j = 0; j < clusters; j++) {
        // Re-calculate our centroids by taking the mean of the cluster it belongs to
        var temp_centroid = data
          .filter((_, i) => labels[i] == j)
          .reduce((sum, vector) => sum.add(vector))
          .divide(data.length)
        centroids.push(temp_centroid)
      }

      distances = this.getPointDistances(data, centroids, this.euclideanDistance)
      labels = this.getLabels(distances)
    }
    return { labels, centroids }
  }

  private getInitialCentroids(data: Vector[], clusters: number) {
    var xIndexes = new Array(clusters).fill(0).map(_ => Math.floor(Math.random() * data.length))
    var centroids = xIndexes.map(index => data[index]);
    return centroids
  }

  /**
   * @param distanceFunction A function that returns the distance between two data points of type T
   * @returns An array of size data.length x centroids.length containing the distance between each data point and each centroid
   */
  private getPointDistances(data: Vector[], centroids: Vector[], distanceFunction: (a: Vector, b: Vector) => number): number[][] {
    var distances = data.map(point => centroids.map(centroid => distanceFunction(point, centroid)));
    return distances
  }

  private euclideanDistance(points: Vector, centroids: Vector): number {
    return Math.sqrt(points.subtract(centroids).pow(2).sum());
  }

  private getLabels(distances: number[][]): number[] {
    return distances.map(distance => distance.indexOf(Math.min(...distance)));
  }
}
