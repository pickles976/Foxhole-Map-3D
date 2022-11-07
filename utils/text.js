import * as THREE from 'three'
import { FontLoader } from 'three/examples/loaders/FontLoader'
import { TextGeometry } from 'three/examples/geometries/TextGeometry'
import { regionMappings, regionNames } from './regions.js';
import { HEX_H, HEX_W, RATIO, SCALE, MAP_SIZE } from './config.js';
import { CreateHexagon } from './hexagon.js';

const TEXT_Y = 512
const TEXT_SIZE = 100

// Materials

const loader = new FontLoader();

let labels = []

const meshMaterial = new THREE.MeshStandardMaterial ({
    color: 0xffffff,
    flatShading: true,
    roughness: 0,
    metalness: 0,
    emissive: 0xffffff,
    emissiveIntensity: 5.0,
})

const spriteMaterial = new THREE.SpriteMaterial({
    color: Math.random() * 0xffffff,
})

export function CreateLabels(scene){

    for(const key in regionMappings){

        const val = regionMappings[key]
        // console.log(key, val)

        _DrawText({
            scene,
            position: _OffsetToPosition(val),
            text: regionNames[key],
            size: TEXT_SIZE,
            height:  0,
        })

    }
}

export function UpdateLabels(position){

    labels.forEach((mesh) => {
        mesh.lookAt(position)
    })

}

//TODO: GET THIS OUT OF HERE
export function CreateHexagons(scene){
    for(const key in regionMappings){

        const val = regionMappings[key]

        const hexagon = CreateHexagon()
        const offset = _OffsetToPosition(val)
        hexagon.position.x = offset.x
        hexagon.position.z = offset.z
        scene.add(hexagon)
    }
}

function _OffsetToPosition(offset){

    let x = (MAP_SIZE / 2)
    let z = (MAP_SIZE / RATIO / 2)

    x += offset[1] * HEX_H * SCALE
    z += offset[0] * HEX_W * SCALE

    return new THREE.Vector3(x, TEXT_Y, z)
}

function _DrawText(params){

    loader
        .setPath('./node_modules/three/examples/fonts/')
        .load('helvetiker_regular.typeface.json', (font) => {
            const geometry = new TextGeometry(params.text ?? "ERROR: TEXT NOT FOUND", 
                {
                    font: font,
                    size: params.size ?? 3,  // ui: size
                    height: params.height ?? 0.2,  // ui: height
                    curveSegments: params.curveSegments ?? 12,  // ui: curveSegments
                    bevelEnabled: params.bevelEnabled ?? false,  // ui: bevelEnabled
                    bevelThickness: params.bevelThickness ?? 0.15,  // ui: bevelThickness
                    bevelSize: params.bevelSize ?? 0.3,  // ui: bevelSize
                    bevelSegments: params.bevelSegments ?? 5,  // ui: bevelSegments
                })

            // geometry.rotateY(-Math.PI / 2)
            geometry.center()

            const mesh = new THREE.Mesh(geometry, meshMaterial)
            mesh.position.set(...params.position)

            labels.push(mesh)
        
            params.scene.add(mesh)

        }
      )
}