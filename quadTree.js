import { Vector3 } from 'three';

const MIN_SIZE = 256
let position = camera.position;

function buildTree(xOffset, yOffset, width, depth) {

    if (height < minSize){
        return undefined
    } 

    const center = new Vector3(width / 2, height / 2, 0) 

    const currentLOD = Math.floor(Math.log(16384 / position.distanceTo(center)))

    if (currentLOD > depth) {

        const newXOffset = xOffset * 2
        const newYOffset = yOffset * 2

        // actual nodes
        return {
            xOffset,
            yOffset,
            width,
            ne : buildTree(newXOffset + 1, newYOffset + 1, width / 2, depth + 1),
            nw: buildTree(newXOffset + 0, newYOffset + 1, width / 2, depth + 1),
            se: buildTree(newXOffset + 1, newYOffset + 0, width / 2, depth + 1),
            sw: buildTree(newXOffset + 0, newYOffset + 0, width / 2, depth + 1),
        }

    }

    // render stuff

    return undefined
    
}