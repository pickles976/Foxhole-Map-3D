import * as THREE from 'three'

const loader = new THREE.TextureLoader();

export function createGroundChunk(size, segments, xOffset, yOffset,) {

    let disMap = loader
        .setPath('./resources/quadmaps/')
        .load(`${xOffset}_${yOffset}_0.png`);

    const groundMat = new THREE.MeshStandardMaterial ({
        color: Math.random() * 0xffffff,
        // wireframe: true,
        displacementMap: disMap,
        displacementScale: 150,
        flatShading: true,
    })

    const groundGeo = new THREE.PlaneGeometry(size, size, segments, segments);

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = yOffset * size;
    groundMesh.position.x = xOffset * size;

    return groundMesh
}