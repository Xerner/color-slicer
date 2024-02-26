import sys
import numpy as np
from typing import Tuple
from sklearn.cluster import KMeans
from meshgen import Logger, ImageService

np.set_printoptions(threshold=sys.maxsize)

class KmeansMeshGen():
  COLOR_MULTIPLIER = 255
  MASK_VALUE = 0
  MASK_COLOR = (0, 0, 0, 0)

  def __init__(self) -> None:
    self.logger = Logger()
    self.image_service = ImageService()

  def create_image_kmeans(self, k_clusters: int, image_filepath: str, labels_offset = 0):
    self.logger.info(f"Kmeans clustering image {image_filepath} with {k_clusters} clusters")
    rgb_image, rgba_image = self.image_service.load_image(image_filepath)
    rgb_array = np.array(rgb_image)
    rgba_array = np.array(rgba_image)
    rgb_array_2d, original_shape = self.image_service.reshape_image(rgb_array)
    _, labels = self._kmeans_cluster_image(k_clusters, original_shape, rgb_array_2d)
    # The offset is sometimes necessary so that we can use certian values, such as 0, as a mask value
    labels += labels_offset 
    return rgba_array, labels

  def generate_color_layers_from_image(self, k_clusters: int, image_filepath: str, output_dir: str):
    self.logger.info(f"Generating color layers for image {image_filepath} with {k_clusters} clusters")
    rgba_array, labels = self.create_image_kmeans(k_clusters, image_filepath)
    color_layers = []
    for label in range(1, k_clusters+1):
      label_layer = self.create_label_layer(rgba_array, labels, label)
      color_layer = self.image_service.create_color_layer(label, label_layer)
      color_layers.append(color_layer)
      self.image_service.write_image(color_layer, image_filepath, output_dir, label)

    return color_layers

  def create_label_layer(self, array: list, kmeans_labels: list, desired_label: int, mask_value = MASK_VALUE):
      full_mask_array = np.full_like(array, mask_value, int)
      label_mask = self.create_mask(kmeans_labels, desired_label)
      masked_image = self.mask(array, label_mask, surrogate_value=full_mask_array)
      return masked_image
      
  def _kmeans_cluster_image(self, k_clusters: int, original_image_shape, image_array2D: np.ndarray) -> Tuple[KMeans, np.ndarray]:
    # Perform K-means clustering
    self.logger.info(f"Performing K-means clustering with {k_clusters} clusters")
    kmeans = KMeans(n_clusters=k_clusters)
    kmeans = kmeans.fit(image_array2D)
    labels_reshaped = kmeans.labels_.reshape(original_image_shape) # Reshape the labels array to match the original image shape
    return kmeans, labels_reshaped

  def create_mask(self, array, mask, masked_value = MASK_VALUE):
    return np.where(array == mask, array, masked_value)
  
  def mask(self, image_array: np.ndarray, mask_array: np.ndarray, masked_value = MASK_VALUE, surrogate_value = 0):
    inverse_mask = mask_array != masked_value
    inverse_mask_with_shape = np.repeat(inverse_mask[:, :, np.newaxis], image_array.shape[2], axis=2)
    return np.where(inverse_mask_with_shape, image_array, surrogate_value)
  