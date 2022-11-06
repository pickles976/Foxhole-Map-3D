import * as THREE from 'three'
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FlyControls } from 'three/examples/jsm/controls/FlyControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module'
import { createGroundChunk } from './utils/mesh.js';
import { TilesToRender } from './utils/quadtree.js';
import { CreateLabels } from './utils/text.js';
import { Water } from './utils/Water.js';
import { Sky } from './utils/Sky.js'

const MAP_SIZE = 16384

let canvas, renderer, camera, scene, controls
let sun, sky, water

function init() {

    // grab canvas
    canvas = document.querySelector('#c');
    renderer = new THREE.WebGLRenderer({
        canvas,
        logarithmicDepthBuffer: true,
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    // document.body.appendChild( renderer.domElement );
    // renderer.shadowMap.enabled = true;
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEBE2DB, 0.00003);


    // camera
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 10, 2000000 );
    camera.position.set(0, 1024, 0);
    camera.up.set(0, 1, 0);
    camera.lookAt(MAP_SIZE / 2, 0, MAP_SIZE / 2);

    controls = new FlyControls(camera, canvas);
    controls.movementSpeed = 100;
    controls.rollSpeed = Math.PI / 24;
    controls.autoForward = false;
    controls.dragToLook = true;
    controls.update(0.01);

    // lighting
    const color = 0xFFFFFF;
    const intensity = 0.6;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);

    const ambient = new THREE.AmbientLight(color, 0.3);
    scene.add(ambient);

    const axesHelper = new THREE.AxesHelper( 5000 );
    scene.add( axesHelper );

}

function initSky() {

     sky = new Sky();
    sky.scale.setScalar( 100000 );
    scene.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    const parameters = {
        elevation: 52.5,
        azimuth: 56
    };

    const pmremGenerator = new THREE.PMREMGenerator( renderer );
    let renderTarget;

    sun = new THREE.Vector3();

    function updateSun() {

        const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
        const theta = THREE.MathUtils.degToRad( parameters.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
        water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

        if ( renderTarget !== undefined ) renderTarget.dispose();

        renderTarget = pmremGenerator.fromScene( sky );

        scene.environment = renderTarget.texture;

    }

    updateSun();

    // GUI

    const gui = new GUI();

    const folderSky = gui.addFolder( 'Sky' );
    folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
    folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
    folderSky.open();
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

    // water
    water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
   
    renderer.render(scene, camera);

    UpdateTerrain()
    
    requestAnimationFrame(render)
}

function initWater() {

    const waterGeometry = new THREE.PlaneGeometry( MAP_SIZE * 10, MAP_SIZE * 10, 100, 100 );

    water = new Water(
        waterGeometry,
        {
            textureWidth: 2048,
            textureHeight: 2048,
            waterNormals: new THREE.TextureLoader().load( './resources/waternormals.jpg', function ( texture ) {

                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

            } ),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 8,
            fog: scene.fog !== undefined
        }
    )

    water.position.x += MAP_SIZE / 2
    water.position.z += MAP_SIZE / 2
    water.position.y = 0.5

    water.rotation.x = - Math.PI / 2;

    scene.add( water );
}

// Terrain Chunk array
let chunkIndex = new Set() // Active chunks by x_y_size key
let chunkMap = {}   // mapping of x_y_size chunks to uuid
let terrainCache = {}   // old meshes cached for quick access
let trash = []

async function UpdateTerrain(){

    const tilesToRender = TilesToRender({
        xOffset: 0,
        zOffset: 0, 
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
initWater()
initSky()
CreateLabels(scene)
UpdateTerrain()

const geometry = new THREE.BoxGeometry( 30, 30, 30 );
const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

const mesh = new THREE.Mesh( geometry, material );
mesh.position.y += 1024
scene.add( mesh );

// console.log(text)

requestAnimationFrame(render)
