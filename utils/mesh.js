import * as THREE from 'three'
import { PLANE_SEGMENTS } from './config.js';

const loader = new THREE.TextureLoader();

let planes = {}

const LOCAL = false

const localHeightMaps = './resources/heightmaps/'
const localTextureMaps = './resources/textures/'

const remoteHeightMaps = 'https://raw.githubusercontent.com/pickles976/Foxhole-Map-3D-Tiles/main/heightmaps/'
const remoteTextureMaps = 'https://raw.githubusercontent.com/pickles976/Foxhole-Map-3D-Tiles/main/texturemaps/'

export function createGroundChunk(size, xOffset, zOffset) {

    let disMap = loader
        .setPath(LOCAL ? localHeightMaps : remoteHeightMaps)
        .load(
            `${zOffset}_${xOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load heightmap: ${zOffset}_${xOffset}_${size}.png`));

    let tex = loader
        .setPath(LOCAL ? localTextureMaps : remoteTextureMaps)
        .load(
            `${zOffset}_${xOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load texture: ${zOffset}_${xOffset}_${size}.png`));

    if (planes[size] === undefined){
        // share geometry for all planes
        const groundGeo = new THREE.PlaneGeometry(size, size, PLANE_SEGMENTS, PLANE_SEGMENTS);
        groundGeo.rotateX(-Math.PI / 2); 

        planes[size] = groundGeo
    }

    const groundMat = new THREE.MeshStandardMaterial ({
        map: tex,
        color: 0xFFFFFF,
        displacementMap: disMap,
        displacementScale: 100,
        flatShading: true,
        roughness: 0.7,
        metalness: 0,
        envMapIntensity: 0.3,
    })

    const groundMesh = new THREE.Mesh(planes[size], groundMat);
    // groundMesh.rotation.x = Math.PI / 2
    groundMesh.rotation.y = -Math.PI / 2
    groundMesh.position.z = (zOffset * size) + (size / 2);
    groundMesh.position.x = (xOffset * size) + (size / 2);

    return groundMesh
}