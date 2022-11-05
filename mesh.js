import * as THREE from 'three'

const loader = new THREE.TextureLoader();

const SEGMENTS = 256;

export function createGroundChunk(size, xOffset, yOffset, zOffset) {

    let disMap = loader
        .setPath('./resources/quadmaps/')
        .load(`${xOffset}_${yOffset}_${zOffset}.png`);

    // console.log(`${xOffset}_${yOffset}_${zOffset}.png`)

    const groundMat = new THREE.MeshStandardMaterial ({
        color: Math.random() * 0xffffff,
        // wireframe: true,
        displacementMap: disMap,
        displacementScale: 150,
        flatShading: true,
    })

    const groundGeo = new THREE.PlaneGeometry(size, size, SEGMENTS, SEGMENTS);

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = yOffset * size;
    groundMesh.position.x = xOffset * size;

    return groundMesh
}