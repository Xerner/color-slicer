import os
import sys
from types import NoneType
import numpy as np
from typing import Tuple
from sklearn.cluster import KMeans
from PIL import Image
from meshgen import Logger

np.set_printoptions(threshold=sys.maxsize)

class KmeansMeshGen():
  OUTPUT_FILENAME = "{}_layer_{}.png"
  COLOR_MULTIPLIER = 255
  MASK_VALUE = 0
  MASK_COLOR = (0, 0, 0, 0)

  def __init__(self) -> None:
    self.logger = Logger()

  def generate_layers(self, k_clusters: int, image_file: str, output_dir: str):
    self.logger.info(f"Generating mesh for image {image_file} with {k_clusters} clusters")
    rgb_image, rgba_image = self.load_image(image_file)
    rgb_array = np.array(rgb_image)
    rgba_array = np.array(rgba_image)
    rgb_array_2d, original_shape = self._reshape_image(rgb_array)
    _, labels = self._kmeans_cluster_image(k_clusters, original_shape, rgb_array_2d)
    labels += 1 # increment 1 so we can use 0 as the mask value
    full_mask_array = np.full_like(rgba_array, self.MASK_VALUE, int)
    for label in range(1, k_clusters+1):
      label_mask = self.create_mask(labels, label)
      masked_image = self.mask(rgba_array, label_mask, surrogate_value=full_mask_array)
      average_color = self._get_image_average_color(masked_image)
      masked_image = self._replace_color(masked_image, average_color, full_mask_array)
      self._write_image(masked_image, image_file, output_dir, label)

  def add_alpha_channel(self, image_array: np.ndarray) -> np.ndarray:
    return np.concatenate((image_array, np.full((image_array.shape[0], image_array.shape[1], 1), 255, dtype=np.uint8)), axis=2)

  def load_image(self, image_path: str):
    self.logger.info("Loading image")
    rgb_image = Image.open(image_path)
    rgba_image = rgb_image.convert('RGBA')
    return rgb_image, rgba_image

  def _kmeans_cluster_image(self, k_clusters: int, original_image_shape, image_array2D: np.ndarray) -> Tuple[KMeans, np.ndarray]:
    # Perform K-means clustering
    self.logger.info(f"Performing K-means clustering with {k_clusters} clusters")
    kmeans = KMeans(n_clusters=k_clusters)
    kmeans = kmeans.fit(image_array2D)
    labels_reshaped = kmeans.labels_.reshape(original_image_shape) # Reshape the labels array to match the original image shape
    return kmeans, labels_reshaped

  def _reshape_image(self, image_array: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    image_array_2d = image_array.reshape(-1, 3) # Turn the 3D image array to a 2D array
    # self.logger.info(f"Image Array\n\n{image_array_2d}\n")
    return image_array_2d, image_array.shape[:2]

  def create_mask(self, array, mask, masked_value = MASK_VALUE):
    return np.where(array == mask, array, masked_value)
  
  def mask(self, image_array: np.ndarray, mask_array: np.ndarray, masked_value = MASK_VALUE, surrogate_value = 0):
    inverse_mask = mask_array != masked_value
    inverse_mask_with_shape = np.repeat(inverse_mask[:, :, np.newaxis], image_array.shape[2], axis=2)
    return np.where(inverse_mask_with_shape, image_array, surrogate_value)
  
  def _replace_color(self, rgba_array, label_color, full_mask_array, masked_color = MASK_COLOR):
    rgba_array = np.where(rgba_array == full_mask_array, masked_color, label_color)
    return rgba_array
  
  def _get_image_average_color(self, rgba_array, ignore_value = MASK_VALUE):
    valid_pixels = rgba_array[rgba_array != ignore_value].reshape(-1, 4)
    average_color = np.mean(valid_pixels, axis=0)
    average_color = tuple(average_color.astype(int))
    return average_color

  def _write_image(self, rgba_array, image_file: str, output_dir: str, i: int):
    filename = os.path.splitext(os.path.basename(image_file))[0]
    output_filename = self.OUTPUT_FILENAME.format(filename, i)
    output_path = os.path.join(output_dir, output_filename)
    self.logger.info(f"Writing image for layer {i} to {output_path}")
    rgba_array = self._convert_rgba_array_to_saveable_type(rgba_array)
    image = Image.fromarray(rgba_array, 'RGBA')
    image.save(output_path)

  def _convert_rgba_array_to_saveable_type(self, rgba_array: np.ndarray) -> np.ndarray:
    list = rgba_array.tolist()
    for i in range(len(list)):
      row = list[i]
      for j in range(len(row)):
        pixel = list[i][j]  
        list[i][j] = (pixel[0], pixel[1], pixel[2], pixel[3])
    return np.array(list, dtype=np.uint8)

