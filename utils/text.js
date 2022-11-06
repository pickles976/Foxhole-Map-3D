import * as THREE from 'three'
import { FontLoader } from 'three/examples/loaders/FontLoader'
import { TextGeometry } from 'three/examples/geometries/TextGeometry'
import { regionMappings, regionNames } from './regions.js';

const loader = new FontLoader();

const meshMaterial = new THREE.MeshStandardMaterial ({
    color: Math.random() * 0xffffff,
    flatShading: true,
    roughness: 0.7,
    metalness: 0,
})

const spriteMaterial = new THREE.SpriteMaterial({
    color: Math.random() * 0xffffff,
})

const TEXT_Y = 512

// true hex sizes
const HEX_H = 1900
const HEX_W = 2197

// true map size
const RATIO = 1.1021839
const MAP_H = HEX_H * 7
const MAP_W = HEX_H / RATIO

// 3D map size
const MAP_SIZE = 16384

// (IMAGE_H / MAP_H) * (MAP_SIZE / IMAGE_H) -> IMAGE_H drops out
const SCALE = MAP_SIZE / MAP_H

export function CreateLabels(scene){

    for(const key in regionMappings){

        const val = regionMappings[key]
        console.log(key, val)

        _DrawText({
            scene,
            position: _OffsetToPosition(val),
            text: key,
            size: 100,
            height:  0,
        })

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

            geometry.rotateY(-Math.PI / 2)
            geometry.center()

            const mesh = new THREE.Mesh(geometry, meshMaterial)
            mesh.position.set(...params.position)
        
            params.scene.add(mesh)

        }
      )
}