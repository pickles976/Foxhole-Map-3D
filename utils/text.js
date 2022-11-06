import * as THREE from 'three'
import { FontLoader } from 'three/examples/loaders/FontLoader'
import { TextGeometry } from 'three/examples/geometries/TextGeometry'

const loader = new FontLoader();

export function CreateText(params){

    const geometry = loader
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
        });
        console.log(font)
        return geometry
      });

    const material = new THREE.MeshStandardMaterial ({
        color: Math.random() * 0xffffff,
        flatShading: true,
        roughness: 0.7,
        metalness: 0,
    })

    const mesh = new THREE.Mesh(geometry, material)
    
    mesh.position.set(...params.position)

    return mesh

}