import * as THREE from 'three'
import { FontLoader } from 'https://unpkg.com/three@0.146.0/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'https://unpkg.com/three@0.146.0/examples/jsm/geometries/TextGeometry.js'
import { regionMappings, regionNames } from './regions.js';
import { OffsetToPosition } from './utils.js';
import { TEXT_SIZE, TEXT_Y } from './config.js';

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

export function CreateLabels(scene){

    for(const key in regionMappings){

        const val = regionMappings[key]

        const pos = OffsetToPosition(val)
        pos.y = TEXT_Y

        _DrawText({
            scene,
            position: pos,
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

function _DrawText(params){

    
    loader
        .setPath('./static/fonts/')
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