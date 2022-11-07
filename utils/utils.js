import * as THREE from 'three'
import { HEX_H, HEX_W, MAP_SIZE, RATIO, SCALE } from "./config.js"

export function OffsetToPosition(offset){

    let x = (MAP_SIZE / 2)
    let z = (MAP_SIZE / RATIO / 2)

    x += offset[1] * HEX_H * SCALE
    z += offset[0] * HEX_W * SCALE

    return new THREE.Vector3(x, 0, z)
}