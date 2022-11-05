import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module'
import { createGroundChunk } from './mesh.js';

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

const CHUNK_SIZE = 256

// grab canvas
const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});

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

const scene = new THREE.Scene();

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

    // updateTerrain();

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

function buildTree(xOffset, yOffset, size) {

    if (size < CHUNK_SIZE){
        return undefined
    } 

    const center = new Vector3((yOffset * size) / 2, (xOffset * size) / 2, 0) 

    // const currentLOD = Math.sqrt(Math.floor(camera.position.distanceTo(center) / 2048))
    const currentLOD = Math.sqrt(Math.floor(new Vector3(2500,0,0).distanceTo(center) / 2048))

    // console.log(new Vector3(0,0,0).distanceTo(center) / 2048)

    if (currentLOD < Math.floor(Math.log(size / CHUNK_SIZE))) {

        const newXOffset = xOffset * 2
        const newYOffset = yOffset * 2
        const newSize = size / 2

        // actual nodes
        return {
            xOffset,
            yOffset,
            size,
            ne : buildTree(newXOffset + 1, newYOffset + 1, newSize),
            nw: buildTree(newXOffset, newYOffset + 1, newSize),
            se: buildTree(newXOffset + 1, newYOffset, newSize),
            sw: buildTree(newXOffset, newYOffset, newSize),
        }

    }

    const chunk = createGroundChunk(size, xOffset, yOffset, currentLOD)
    scene.add(chunk)

    console.log(currentLOD)

    // render stuff
    return {
        chunk,
        xOffset,
        yOffset,
        size
    }
    
}

// lighting
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// Terrain Chunk array
// const HEIGHT = 16128
// const WIDTH  = 17664
const HEIGHT = 2560
const WIDTH = 2560
const SIZE = 256

buildTree(0,0,4096)

// let terrain = {}

// // INITIALIZE EMPTY TERRAIN MAP
// for (let j = 0; j < WIDTH / SIZE; j++){

//     terrain[j] = {}

//     for (let i = 0; i < HEIGHT / SIZE; i++){
//         terrain[j][i] = {
//             LOD: 0,
//             chunk: {},
//         }
//     }
// }

// function updateTerrain(){
//     const currentLOD = 1

//     // UPDATE IF LOD HAS CHANGED
//     for (let i = 0; i < HEIGHT / SIZE; i++){
//         for (let j = 0; j < WIDTH / SIZE; j++){

//             const currentLOD = Math.floor(camera.position.distanceTo(new Vector3(j * SIZE, i * SIZE, 0)) / 2000)

//             if (terrain[j][i].LOD != currentLOD) {

//                 const chunk = createGroundChunk(SIZE, SIZE / (2 ** currentLOD), j, i)
//                 scene.add(chunk)

//                 // dispose of old chunk
//                 const object = scene.getObjectByProperty( 'uuid', terrain[j][i].chunk.uuid );
//                 if (object) {
//                     object.geometry.dispose();
//                     object.material.dispose();
//                     scene.remove( object );
//                 }

//                 terrain[j][i] = {
//                     LOD: currentLOD,
//                     chunk
//                 }
//             }

//             // terrain.push(chunk)
//         }
//     }
// }

requestAnimationFrame(render)
