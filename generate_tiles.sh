#!/bin/bash

echo 'Generating tiles...'

python /preprocessing/heightmap_tiler.py
python /preprocessing/texture_tiler.py

echo 'Copying tiles...'

cp -a /preprocessing/quadmaps/. /resources/quadmaps
cp -a /preprocessing/texturemaps/. /resources/textures