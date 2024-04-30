# Color Slicer

A project for creating an algorithm and possibly a front-end for turning an image into a multicolor, multilayer 3d mesh for 3d printing

## Steps

1. Cluster an image into a set number of colors using KMeans
2. Separate the clustered array into separate arrays (layers) by color
3. Create a mesh out of each array (layer)
4. (Needs Refinement) Export the meshes to a file format that can be 3d printed? (STL, OBJ, etc.)
