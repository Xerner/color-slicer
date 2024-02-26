import { Injectable } from '@angular/core';
import { Pixel } from '../models/pixel';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  onImageFileSelected = new ReplaySubject<File>(0);

  // Good
  getOutputFilename(filename: string, index: number) {
    return `${filename}_layer_${index}.png`;
  }

  // Good
  addAlphaChannel(image: Pixel[], alphaValue = 255) {
    image.forEach(pixel => pixel.a = alphaValue);
  }

  // Bad
  loadImage(imagePath: string): { rgbPixels: Pixel[], rgbaPixels: Pixel[] } {
    console.log("Loading image")
    // rgb_image = Image.open(os.path.abspath(image_path))
    // rgba_image = rgb_image.convert('RGBA')
    // return rgb_image, rgba_image
    return { rgbPixels: [], rgbaPixels: [] };
  }

  // Bad
  writeImage(pixels: Pixel[], imageFilepath: string, outputDir: string, i: number) {
    var filename = "";
    // var filename = os.path.splitext(os.path.basename(imageFilepath))[0]
    var outputFilename = this.getOutputFilename(filename, i)
    var outputPath = "";
    // var outputPath = os.path.join(outputDir, outputFilename)
    console.log(`Writing image for layer ${i} to ${outputPath}`)
    // pixels = this.convert_rgba_array_to_saveable_type(pixels)
    // image = Image.fromarray(pixels, 'RGBA')
    // image.save(outputPath)
  }

  // Bad
  /**
   * This needs a better name
   * @param self 
   * @param pixels 
   */
  reshapeImage(pixels: Pixel[]): { rgbPixels2D: Pixel[], original_shape: number[] } {
    // image_array_2d = image_array.reshape(-1, 3) // Turn the 3D image array to a 2D array
    // self.logger.info(f"Image Array\n\n{image_array_2d}\n")
    // return image_array_2d, image_array.shape[:2]
    return { rgbPixels2D: [], original_shape: [] };
  }
  
  // Good
  getImageAveragePixel(pixels: Pixel[], ignoreValue: Pixel): Pixel {
    var averagePixel = pixels.reduce((curPixel, prevPixel, i) => {
      if (curPixel != ignoreValue) {
        return prevPixel.add(curPixel);
      } else {
        return prevPixel;
      }
    }).divide(pixels.length);
    return averagePixel
  }
  
  // convert_rgba_array_to_saveable_type(self, rgba_array: np.ndarray) -> np.ndarray:
  //   list = rgba_array.tolist()
  //   for i in range(len(list)):
  //     row = list[i]
  //     for j in range(len(row)):
  //       pixel = list[i][j]  
  //       list[i][j] = (pixel[0], pixel[1], pixel[2], pixel[3])
  //   return np.array(list, dtype=np.uint8)
  
  // Good
  createColorLayer(pixels: Pixel[], colorLabels: number[], targetLabel: number, emptyPixel = new Pixel(0, 0, 0, 0)) {
    var averagePixel = this.getImageAveragePixel(pixels, new Pixel(0, 0, 0, 0));
    var colorLayer = pixels.map((_, i) => colorLabels[i] === targetLabel ? averagePixel : emptyPixel);
    return colorLayer
  }
}
