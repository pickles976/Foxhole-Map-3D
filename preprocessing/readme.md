# Notes about processing

The Heightmap is the larger of the two maps at 16015x17635 pixels. 
Because the heightmap isn't a perfect square, I crop it and add some padding to make it 16384x16384, 
a power of two that will play well with our quadtree.  

The texture map is slightly smaller, so I scale it up to the heightmap size (it has the same aspect ratio as the heightmap)  
We build a tree of tiles where each image is split into 4 over and over until they are 256x256, these images are then (optionally) downscaled further into 128x128.  

The filenames are x_y_size making it easy to load them from indices in THREE.js  

Note that Y is up in THREE.js but idgaf I'm a gangster I make my own rules tbh.

If generating the files you might want to scale down the images. At full size, the tiled images are over 400Mb total