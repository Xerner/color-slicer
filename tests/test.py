from meshgen import KmeansMeshGen

if (__name__ == "__main__"):
  kmeans_gen = KmeansMeshGen()
  kmeans_gen.generate_layers(
    k_clusters=3, \
    image_file=r"A:\Projects\KMeansMeshGen\tests\red_green_blue_gradient_16x16.png", \
    output_dir=r"A:\Projects\KMeansMeshGen\tests\output"
  )
