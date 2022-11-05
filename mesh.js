import * as THREE from 'three'

const loader = new THREE.TextureLoader();

const SEGMENTS = 128;

export function createGroundChunk(size, xOffset, yOffset) {

    let disMap = loader
        .setPath('./resources/quadmaps/')
        .load(
            `${xOffset}_${yOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load heightmap: ${xOffset}_${yOffset}_${size}.png`));

    let tex = loader
        .setPath('./resources/textures/')
        .load(
            `${xOffset}_${yOffset}_${size}.png`,
            () => {},
            () => {},
            () => console.log(`Failed to load texture: ${xOffset}_${yOffset}_${size}.png`));

    const groundMat = new THREE.MeshStandardMaterial ({
        // color: Math.random() * 0xffffff,
        // color: 0x009A17,
        // wireframe: true,
        map: tex,
        displacementMap: disMap,
        displacementScale: 150,
        flatShading: true,
    })

    const groundGeo = new THREE.PlaneGeometry(size, size, SEGMENTS, SEGMENTS);

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = (yOffset * size) + (size / 2);
    groundMesh.position.x = (xOffset * size) + (size / 2);

    return groundMesh
}