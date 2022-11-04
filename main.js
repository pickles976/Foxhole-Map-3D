import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module'

const sliderVals = {
    widthSeg: 2500,
    heightSeg: 2500,
    heightMap: 'AllodsBight_HeightMap.png',
    horTexture: 1,
    vertTexture: 1,
    dispScale: 150,
}

const sliders = new GUI();
sliders.add(sliderVals, 'widthSeg', 0, 10000).onChange(updateGroundMesh)
sliders.add(sliderVals, 'heightSeg', 0, 10000).onChange(updateGroundMesh)
sliders.add(sliderVals, 'heightMap', ['Acrithia_HeightMap.png', 'AllodsBight_HeightMap.png']).onChange(updateGroundMat)
sliders.add(sliderVals, 'horTexture', 0, 1).onChange(updateGroundMat)
sliders.add(sliderVals, 'vertTexture', 0, 1).onChange(updateGroundMat)
sliders.add(sliderVals, 'dispScale', 0, 200).onChange(updateGroundMat)

const loader = new THREE.TextureLoader();

const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({canvas});

const fov = 40;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 10000;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 50, 0);
camera.up.set(0, 0, 1);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 5, 0);
controls.update();

const scene = new THREE.Scene();

let disMap = loader
        .setPath('./resources/heightmaps/HeightMapsUncropped/')
        .load(sliderVals.heightMap);

disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping;
disMap.repeat.set(sliderVals.horTexture, sliderVals.vertTexture);

function updateGroundMat() {

    ground.material = new THREE.MeshStandardMaterial ({
        color: 0x00CC00,
        // wireframe: true,
        displacementMap: disMap,
        displacementScale: sliderVals.dispScale,
        flatShading: true,
    })
}

function updateGroundMesh() {
    ground.geometry = new THREE.PlaneGeometry(1000, 1000, sliderVals.widthSeg, sliderVals.heightSeg);
    updateGroundMat();
}

function createGround() {

    const groundGeo = new THREE.PlaneGeometry(1000, 1000, sliderVals.widthSeg, sliderVals.heightSeg);

    const groundMat = new THREE.MeshStandardMaterial ({
        color: 0x00CC00,
        // wireframe: true,
        displacementMap: disMap,
        displacementScale: sliderVals.dispScale,
        flatShading: true,
    })

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    scene.add(groundMesh);
    groundMesh.position.y = -0.05;
    return groundMesh
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

function render(time) {
    time *= 0.001;  // convert time to seconds

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

function makeInstance(geometry, color, x) {
    const material = new THREE.MeshPhongMaterial({
        color
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;

    return cube;
}

// lighting
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

const ground = createGround()

// cubes
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

const cubes = [
    makeInstance(geometry, 0x44aa88,  0),
    makeInstance(geometry, 0x8844aa, -2),
    makeInstance(geometry, 0xaa8844,  2),
];

requestAnimationFrame(render)
