import time
import numpy as np
from scipy.spatial.distance import cdist

k_clusters = 5
data = np.arange(1, 31)
data = data.reshape(-1, 3)
for i in range(10):
  data[i] = [np.random.randint(1, 10), np.random.randint(1, 10), np.random.randint(1, 10)]
idx = np.random.choice(len(data), k_clusters, replace=False)
centroids = data[idx, :]
# print(data)
# print(centroids)
distances = cdist(data, centroids,'euclidean')
# print(distances)
points = np.array([np.argmin(distance) for distance in distances]) # for each point, 
# print(points)

# Learnin time
time_ = time.time()
for _ in range(10): 
  print('Epoch',_,'\t', round(time.time() - time_,2),'sec')

  # We re-calculate our centroids every iteration
  centroids = []
  for j in range(k_clusters):
    # Re-calculate our centroids by taking the mean of the cluster it belongs to
    temp_centroid = data[points==j].mean(axis=0)
    # print(temp_centroid)
    centroids.append(temp_centroid)

  # Update our centroids
  print(centroids)
  centroids = np.vstack(centroids)
  print(centroids)
  distances = cdist(data, centroids ,'euclidean')
  points = np.array([np.argmin(i) for i in distances])