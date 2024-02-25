import os
import numpy as np
from PIL import Image
from typing import Tuple
from meshgen import Logger, ArrayService

class ImageService:
  OUTPUT_FILENAME = "{}_layer_{}.png"

  def __init__(self) -> None:
    self.logger = Logger()
    self.array_service = ArrayService()

  def add_alpha_channel(self, image_array: np.ndarray) -> np.ndarray:
    return np.concatenate((image_array, np.full((image_array.shape[0], image_array.shape[1], 1), 255, dtype=np.uint8)), axis=2)

  def load_image(self, image_path: str):
    self.logger.info("Loading image")
    rgb_image = Image.open(os.path.abspath(image_path))
    rgba_image = rgb_image.convert('RGBA')
    return rgb_image, rgba_image

  def write_image(self, rgba_array, image_file: str, output_dir: str, i: int):
    filename = os.path.splitext(os.path.basename(image_file))[0]
    output_filename = self.OUTPUT_FILENAME.format(filename, i)
    output_path = os.path.join(output_dir, output_filename)
    self.logger.info(f"Writing image for layer {i} to {output_path}")
    rgba_array = self._convert_rgba_array_to_saveable_type(rgba_array)
    image = Image.fromarray(rgba_array, 'RGBA')
    image.save(output_path)

  def reshape_image(self, image_array: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    This needs a better name>
    """
    image_array_2d = image_array.reshape(-1, 3) # Turn the 3D image array to a 2D array
    # self.logger.info(f"Image Array\n\n{image_array_2d}\n")
    return image_array_2d, image_array.shape[:2]
  
  def get_image_average_color(self, rgba_array: np.ndarray, ignore_value: np.ndarray):
    valid_pixels: np.ndarray = rgba_array[rgba_array != ignore_value].reshape(-1, 4)
    average_color = np.mean(valid_pixels, axis=0)
    average_color = tuple(average_color.astype(int))
    return average_color
  
  def _convert_rgba_array_to_saveable_type(self, rgba_array: np.ndarray) -> np.ndarray:
    list = rgba_array.tolist()
    for i in range(len(list)):
      row = list[i]
      for j in range(len(row)):
        pixel = list[i][j]  
        list[i][j] = (pixel[0], pixel[1], pixel[2], pixel[3])
    return np.array(list, dtype=np.uint8)
  
  def create_color_layer(self, target_label, rgba_array: np.ndarray):
    average_color = self.get_image_average_color(rgba_array)
    color_layer = self.array_service.replace_value(rgba_array, target_label, average_color)
    return color_layer