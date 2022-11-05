import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module'
import { createGroundChunk } from './mesh.js';
import { TilesToRender } from './quadtree.js';

// const sliderVals = {
//     widthSeg: 2500,
//     heightSeg: 2500,
//     heightMap: 'AllodsBight_HeightMap.png',
//     horTexture: 1,
//     vertTexture: 1,
//     dispScale: 150,
// }

// const sliders = new GUI();
// sliders.add(sliderVals, 'widthSeg', 0, 10000).onChange(updateGroundMesh)
// sliders.add(sliderVals, 'heightSeg', 0, 10000).onChange(updateGroundMesh)
// sliders.add(sliderVals, 'heightMap', ['Acrithia_HeightMap.png', 'AllodsBight_HeightMap.png']).onChange(updateGroundMat)
// sliders.add(sliderVals, 'horTexture', 0, 1).onChange(updateGroundMat)
// sliders.add(sliderVals, 'vertTexture', 0, 1).onChange(updateGroundMat)
// sliders.add(sliderVals, 'dispScale', 0, 200).onChange(updateGroundMat)

const CHUNK_SIZE = 256 // Segments per chunk
const MIN_ZOOM = 2048 // distance from tile where LOD = 0 (MAX DETAIL)

// grab canvas
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});
const scene = new THREE.Scene();

// camera
const fov = 40;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 100000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(2048, 2048, 1024);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

// lighting
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function render(time) {
    time *= 0.001;  // convert time to seconds

    UpdateTerrain()

    // fix buffer size
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

    // fix aspect ratio
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
   
    renderer.render(scene, camera);
   
    requestAnimationFrame(render);
}

// Terrain Chunk array
// const HEIGHT = 16128
// const WIDTH  = 17664

let chunkIndex = new Set() // Active chunks by x_y_size key
let chunkMap = {}   // mapping of x_y_size chunks to uuid
let terrainCache = {}   // old meshes cached for quick access

function UpdateTerrain(){

    const tilesToRender = TilesToRender({
        xOffset: 0,
        yOffset: 0, 
        size: 4096, 
        position: camera.position,
    })

    let tilesToDelete = [...chunkIndex].filter((x) => !tilesToRender.has(x))
    let newTiles = [...tilesToRender].filter((x) => !chunkIndex.has(x))

    // remove old tiles
    tilesToDelete.forEach(tile => {

        // remove from scene
        const object = scene.getObjectByProperty( 'uuid', chunkMap[tile] );
        if (object !== undefined){
            object.geometry.dispose();
            object.material.dispose();
            scene.remove( object );
        }

        delete chunkMap[tile]

        chunkIndex.delete(tile)
    })

    // add new tiles
    newTiles.forEach(tile => {
        chunkIndex.add(tile) // save the chunk's index

        const indices = tile.split("_") // use x,y,size to create chunk
        
        const chunk = terrainCache[tile] === undefined ? createGroundChunk(indices[2], indices[0], indices[1]) : terrainCache[tile]

        chunkMap[tile] = chunk.uuid // map x,y,size to chunk for future access and deletion
        scene.add(chunk)
    })

}

UpdateTerrain()

requestAnimationFrame(render)
