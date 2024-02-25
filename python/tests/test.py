import unittest
from meshgen import KmeansMeshGen

[unittest.TestSuite]
class ImageGenerationTests(unittest.TestCase):
  @unittest.skip("Skipping test")
  def test_generate_layers_16x16(self):
    kmeans_gen = KmeansMeshGen()
    kmeans_gen.generate_color_layers_from_image(
      k_clusters=3, \
      image_filepath="./tests/red_green_blue_gradient_16x16.png", \
      output_dir="./tests/output"
    )

  # @unittest.skip("Skipping test")
  def test_generate_layers_giratina(self):
    kmeans_gen = KmeansMeshGen()
    kmeans_gen.generate_color_layers_from_image(
      k_clusters=4, \
      image_filepath="./tests/giratina_v_alt_art.png", \
      output_dir="./tests/output"
    )

if (__name__ == "__main__"):
  unittest.main()
