import * as THREE from 'three'

const loader = new THREE.TextureLoader();

export function createGroundChunk(size, xOffset, yOffset) {

    const groundGeo = new THREE.PlaneGeometry(size, size, size, size);

    let disMap = loader
        .setPath('./resources/heightmaps/')
        .load(`${xOffset}_${yOffset}.png`);

    const groundMat = new THREE.MeshStandardMaterial ({
        color: 0x00CC00,
        // wireframe: true,
        displacementMap: disMap,
        displacementScale: sliderVals.dispScale,
        flatShading: true,
    })

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.position.y = yOffset * size;
    groundMesh.position.x = xOffset * size;
    scene.add(groundMesh);
    return groundMesh
}