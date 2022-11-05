import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.112.1/build/three.module.js';
import { Vector3 } from 'three';

const CHUNK_SIZE = 256
const MIN_ZOOM = 1024

let leaves = []

export function TilesToRender(params){
    
    const tiles = _GetTerrainTiles(params)

    let tilesToRender = new Set()

    tiles.forEach(tile => {
        tilesToRender.add(`${tile.xOffset}_${tile.yOffset}_${tile.size}`);
    });
    
    return tilesToRender

}

function _GetTerrainTiles(params){

    const tree = _QuadTree(params.xOffset, params.yOffset, params.size, params.position)

    return _GetLeaves(tree)

}

function _QuadTree(xOffset, yOffset, size, position) {

    if (size < CHUNK_SIZE){
        return undefined
    } 

    const center = new Vector3((xOffset * size) + (size / 2), (yOffset * size) + (size / 2), 0) 

    const currentLOD = Math.floor(Math.sqrt(position.distanceTo(center) / MIN_ZOOM))

    const depth = Math.floor(Math.log(size / (CHUNK_SIZE / 2)))

    // if the desired LOD is lower than our current depth (chunks of size 256 are the highest zoom level, aka LOD 0)
    if (currentLOD < depth) {

        const newXOffset = xOffset * 2
        const newYOffset = yOffset * 2
        const newSize = size / 2

        // actual nodes
        return {
            xOffset,
            yOffset,
            size,
            ne : _QuadTree(newXOffset + 1, newYOffset + 1, newSize, position),
            nw: _QuadTree(newXOffset, newYOffset + 1, newSize, position),
            se: _QuadTree(newXOffset + 1, newYOffset, newSize, position),
            sw: _QuadTree(newXOffset, newYOffset, newSize, position),
            leaf: false
        }

    }

    // render stuff
    return {
        xOffset,
        yOffset,
        size,
        leaf: true,
    }
    
}

function _GetLeaves(node){

    leaves = []

    _TraverseTree(node)

    return leaves

}

function _TraverseTree(node) {

    if (node.leaf) {
        leaves.push(node)
    } 
    else 
    {
        _TraverseTree(node.ne)
        _TraverseTree(node.nw)
        _TraverseTree(node.se)
        _TraverseTree(node.sw)
    }

}