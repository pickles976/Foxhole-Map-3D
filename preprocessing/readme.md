# How to use this

Copy [these files](www.google.com) into the resources folder.

Run heightmap_tiler.py and texture_tiler.py

Take the files in the preprocessing/quadmaps folder and move them to resources/quadmaps

Take the files in the preprocessing/texturemaps folder and move them to resources/textures

You can now run the 3D map :)

# Notes about processing

The Heightmap is the larger of the two maps at 16015x17635

Pixels. Because the heightmap isn't a perfect square, I crop it and add some padding to make it 16384x16384, a power of two that will play well with our quadtree.  

The texture map is slightly smaller, so I scale it up to the heightmap size (it has the same aspect ratio as the heightmap)  

I think I will change it so that both of the images are simply scaled to the size of the texture map and padded, so that part of the heightmap doesn't have to be cut off.  

We build a tree of tiles where each image is split into 4 over and over until they are 256x256, these images are then downscaled further into 128x128.  

The filenames are x_y_size making it easy to load them from indices in THREE.js  

Note that Y is up in THREE.js but idgaf I'm a gangster I make my own rules tbh.