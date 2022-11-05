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

    // updateTerrain();
    updateTerrainTree(root)

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

    const center = new Vector3((xOffset * size) + (size / 2), (yOffset * size) + (size / 2), 0) 

    // const currentLOD = Math.sqrt(Math.floor(camera.position.distanceTo(center) / 2048))
    const currentLOD = Math.floor(Math.sqrt(camera.position.distanceTo(center) / MIN_ZOOM))

    const depth = Math.floor(Math.log(size / (CHUNK_SIZE / 2)))

    // if the desired LOD is lower than our current depth (chunks of size 256 are the highest zoom level, aka LOD 0)
    if (currentLOD < depth) {

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

    const chunk = createGroundChunk(size, xOffset, yOffset, depth)
    indexChunk(chunk, xOffset, yOffset, depth)
    scene.add(chunk)

    // render stuff
    return {
        chunk,
        xOffset,
        yOffset,
        size
    }
    
}

function updateTerrainTree(node) {

    function removeChunk(){
        // remove old chunk from scene
        const object = scene.getObjectByProperty( 'uuid', node.chunk?.uuid );

        if (object !== undefined){
            object.geometry.dispose();
            object.material.dispose();
            scene.remove( object );
        }

        node.chunk = undefined
    }

    if (node?.size < CHUNK_SIZE){
        return undefined
    } 

    const center = new Vector3((node.xOffset * node.size) + (node.size / 2), (node.yOffset * node.size) + (node.size / 2), 0) 

    // const currentLOD = Math.sqrt(Math.floor(camera.position.distanceTo(center) / 2048))
    const currentLOD = Math.floor(Math.sqrt(camera.position.distanceTo(center) / MIN_ZOOM))

    const depth = Math.floor(Math.log(node.size / (CHUNK_SIZE / 2)))

    // if the desired LOD is lower than our current depth (chunks of size 256 are the highest zoom level, aka LOD 0)
    if (currentLOD < depth) {

        removeChunk()

        const newXOffset = node.xOffset * 2
        const newYOffset = node.yOffset * 2
        const newSize = node.size / 2

        if (node.ne !== undefined) {
            node.ne = updateTerrainTree(node.ne)
        } else {
            node.ne = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.nw !== undefined) {
            node.nw = updateTerrainTree(node.nw)
        } else {
            node.nw = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.se !== undefined) {
            node.se = updateTerrainTree(node.se)
        } else {
            node.se = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.sw !== undefined) {
            node.sw = updateTerrainTree(node.sw)
        } else {
            node.sw = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

    } else if (currentLOD === depth){

        if (node.chunk === undefined){

            let chunk = {}

            if (chunkIndex[node.xOffset]?.[node.yOffset]?.depth !== undefined) {
                chunk = chunkIndex[node.xOffset][node.yOffset][depth] // load previously-generated chunk
            } else {
                chunk = createGroundChunk(node.size, node.xOffset, node.yOffset, depth)
                indexChunk(chunk, node.xOffset, node.yOffset, depth)
            }

            scene.add(chunk)
            node.chunk = chunk
        }
    
    } else {
        removeChunk()

        if (node.ne !== undefined) {
            node.ne = updateTerrainTree(node.ne)
        } 

        if (node.nw !== undefined) {
            node.nw = updateTerrainTree(node.nw)
        } 

        if (node.se !== undefined) {
            node.se = updateTerrainTree(node.se)
        } 

        if (node.sw !== undefined) {
            node.sw = updateTerrainTree(node.sw)
        } 
    }

    return node

}

// index/cache the chunk in memory
function indexChunk(chunk, x, y, z) {

    if (chunkIndex[x] === undefined) {
        chunkIndex[x] = {}
    }

    if (chunkIndex[x][y] === undefined) {
        chunkIndex[x][y] = {}
    }

    if (chunkIndex[x][y][z] === undefined) {
        chunkIndex[x][y][z] = {}
    }

    chunkIndex[x][y][z] = chunk

}

// Terrain Chunk array
// const HEIGHT = 16128
// const WIDTH  = 17664

let chunkIndex = {}

let root = buildTree(0,0,2048)

requestAnimationFrame(render)
