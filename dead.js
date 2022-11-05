
function createWaterPlane() {

    const mat = new THREE.MeshStandardMaterial ({
        color: 0xD4F1F9,
        flatShading: false,
    })

    const geo = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, 100, 100);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.x += MAP_SIZE / 2
    mesh.position.y += MAP_SIZE / 2
    mesh.position.z = 5

    return mesh
}

function updateWater(){
    water.position.z = sliderVals.height
}

// water
const water = createWaterPlane()
scene.add(water)

const sliderVals = {
    height: 0
}

const sliders = new GUI();
sliders.add(sliderVals, 'height', 0, 10).onChange(updateWater)