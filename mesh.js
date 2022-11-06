import * as THREE from 'three'

const loader = new THREE.TextureLoader();

const SEGMENTS = 128;

let planes = {}

export function createGroundChunk(size, xOffset, zOffset) {

    let disMap = loader
        .setPath('./resources/quadmaps/')
        .load(
            `${zOffset}_${xOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load heightmap: ${zOffset}_${xOffset}_${size}.png`));

    let tex = loader
        .setPath('./resources/textures/')
        .load(
            `${zOffset}_${xOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load texture: ${zOffset}_${xOffset}_${size}.png`));

    if (planes[size] === undefined){
        // share geometry for all planes
        const groundGeo = new THREE.PlaneGeometry(size, size, SEGMENTS, SEGMENTS);
        groundGeo.rotateX(-Math.PI / 2); 

        planes[size] = groundGeo
    }

    const groundMat = new THREE.MeshStandardMaterial ({
        // color: Math.random() * 0xffffff,
        // color: 0x009A17,
        // wireframe: true,
        map: tex,
        displacementMap: disMap,
        displacementScale: 100,
        flatShading: true,
        roughness: 0.7,
        metalness: 0,
    })

    const groundMesh = new THREE.Mesh(planes[size], groundMat);
    // groundMesh.rotation.x = Math.PI / 2
    groundMesh.rotation.y = -Math.PI / 2
    groundMesh.position.z = (zOffset * size) + (size / 2);
    groundMesh.position.x = (xOffset * size) + (size / 2);

    return groundMesh
}