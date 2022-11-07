#!/bin/bash

# Copy the files
echo 'Copying Files'
cp ./dist/bundle.js ./static/js/bundle.js
cp ./src/templates.js ./static/js/templates.js
cp -r ./src/ace-builds ./static/js/ace-builds
cp -r ./static ./upload
cp index.html ./upload/index.html