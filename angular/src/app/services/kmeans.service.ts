import { Injectable } from '@angular/core';
import { ImageService } from './image.service';
import { Pixel } from '../models/pixel';

@Injectable({
  providedIn: 'root'
})
export class KmeansService {
  constructor(private imageService: ImageService) { }

  // Bad
  createImageKmeans(k_clusters: number, image_filepath: string, labels_offset = 0) {
    console.log(`Kmeans clustering image ${image_filepath} with ${k_clusters} clusters`)
    var { rgbPixels, rgbaPixels } = this.imageService.loadImage(image_filepath)
    var { rgbPixels2D, original_shape } = this.imageService.reshapeImage(rgbPixels)
    var { kmeans, labels } = this.kmeansClusterImage(k_clusters, original_shape, rgbPixels2D)
    // The offset is sometimes necessary so that we can use certian values, such as 0, as a mask value
    labels.forEach((_, i) => labels[i] += labels_offset)
    return { rgbaPixels, labels }
  }

  // Bad
  generateColorLayersFromImage(k_clusters: number, imageFilepath: string, outputDir: string, maskValue: number) {
    console.log(`Generating color layers for image ${imageFilepath} with ${k_clusters} clusters`)
    var { rgbaPixels, labels } = this.createImageKmeans(k_clusters, imageFilepath)
    var colorLayers: Pixel[][] = []
    for (let i = 0; i < k_clusters+1; i++) {
      var label = labels[i];
      var labelMask = this.createMask(labels, label, maskValue)
      var colorLayer: Pixel[] = this.imageService.createColorLayer(rgbaPixels, labelMask, label)
      colorLayers.push(colorLayer)
      this.imageService.writeImage(colorLayer, imageFilepath, outputDir, label)
    }
    return colorLayers
  }

  // Good
  createMask<T>(array: T[], dontMask: T, maskValue: T): T[] {
    var mask = array.map(value => value === dontMask ? value : maskValue);
    return mask
  }

  // Bad
  kmeansClusterImage(kClusters: number, originalImageShape: number[], imageArray2D: Pixel[]) {
    console.log(`Performing K-means clustering with ${kClusters} clusters`)
    var kmeans = null;
    // var kmeans = KMeans(n_clusters=kClusters)
    // var kmeans = kmeans.fit(imageArray2D)
    // Reshape the labels array to match the original image shape
    // var labels_reshaped = kmeans.labels_.reshape(originalImageShape)
    var labels: number[] = []
    return { kmeans, labels }
  }
}
