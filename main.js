import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module'
import { createGroundChunk } from './mesh.js';
import { TilesToRender } from './quadtree.js';

const MAP_SIZE = 16384

let canvas, renderer, camera, scene, controls;

function init() {

    // grab canvas
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        logarithmicDepthBuffer: true,
    });
    // renderer.shadowMap.enabled = true;
    scene = new THREE.Scene();

    // camera
    const fov = 90;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 100000;
    camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(MAP_SIZE / 2, MAP_SIZE / 2, 1024);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 0);

    controls = new FlyControls(camera, canvas);
    controls.movementSpeed = 100;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    controls.update(0.01);

    // lighting
    const color = 0xFFFFFF;
    const intensity = 0.8;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const ambient = new THREE.AmbientLight(color, 0.6);
    scene.add(ambient);

    const axesHelper = new THREE.AxesHelper( 500 );
    scene.add( axesHelper );

}

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

async function render(time) {

    time *= 0.001;  // convert time to seconds
    controls.update(0.1)

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

    UpdateTerrain()
    
    requestAnimationFrame(render)
}

function initWater() {

    const mat = new THREE.MeshStandardMaterial ({
        color: 0x006994 ,
        flatShading: false,
        roughness: 0,
        metalness: 0,
    })

    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 100, 100);
    const water = new THREE.Mesh(geo, mat);
    water.position.x += MAP_SIZE / 2
    water.position.y += MAP_SIZE / 2
    water.position.z = 4

    scene.add(water)
}

// Terrain Chunk array
let chunkIndex = new Set() // Active chunks by x_y_size key
let chunkMap = {}   // mapping of x_y_size chunks to uuid
let terrainCache = {}   // old meshes cached for quick access
let trash = []

async function UpdateTerrain(){

    const tilesToRender = TilesToRender({
        xOffset: 0,
        yOffset: 0, 
        size: MAP_SIZE, 
        position: camera.position,
    })

    let tilesToDelete = [...chunkIndex].filter((x) => !tilesToRender.has(x))
    let newTiles = [...tilesToRender].filter((x) => !chunkIndex.has(x))

    // remove old tiles
    trash.forEach(id => {
        // remove from scene
        const object = scene.getObjectByProperty( 'uuid', id );
        if (object !== undefined){
            object.geometry.dispose();
            object.material.dispose();
            scene.remove( object );
        }
    })

    trash = []

    // queue for deletion
    tilesToDelete.forEach(tile => {
        trash.push(chunkMap[tile])
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

init()

UpdateTerrain()
initWater()

requestAnimationFrame(render)
