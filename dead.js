function buildTree(xOffset, yOffset, size) {

    if (size < CHUNK_SIZE){
        return undefined
    } 

    const center = new Vector3((xOffset * size) + (size / 2), (yOffset * size) + (size / 2), 0) 

    // const currentLOD = Math.sqrt(Math.floor(camera.position.distanceTo(center) / 2048))
    const currentLOD = Math.floor(Math.sqrt(camera.position.distanceTo(center) / MIN_ZOOM))

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
            ne : buildTree(newXOffset + 1, newYOffset + 1, newSize),
            nw: buildTree(newXOffset, newYOffset + 1, newSize),
            se: buildTree(newXOffset + 1, newYOffset, newSize),
            sw: buildTree(newXOffset, newYOffset, newSize),
        }

    }

    const chunk = createGroundChunk(size, xOffset, yOffset, depth)
    indexChunk(chunk, xOffset, yOffset, depth)
    scene.add(chunk)

    // render stuff
    return {
        chunk,
        xOffset,
        yOffset,
        size
    }
    
}

function updateTerrainTree(node) {

    function removeChunk(){
        // remove old chunk from scene
        const object = scene.getObjectByProperty( 'uuid', node.chunk?.uuid );

        if (object !== undefined){
            object.geometry.dispose();
            object.material.dispose();
            scene.remove( object );
        }

        node.chunk = undefined
    }

    function updateChildren(){
        if (node.ne !== undefined) {
            node.ne = updateTerrainTree(node.ne)
        } 

        if (node.nw !== undefined) {
            node.nw = updateTerrainTree(node.nw)
        } 

        if (node.se !== undefined) {
            node.se = updateTerrainTree(node.se)
        } 

        if (node.sw !== undefined) {
            node.sw = updateTerrainTree(node.sw)
        } 
    }

    if (node?.size < CHUNK_SIZE){
        return undefined
    } 

    const center = new Vector3((node.xOffset * node.size) + (node.size / 2), (node.yOffset * node.size) + (node.size / 2), 0) 

    // const currentLOD = Math.sqrt(Math.floor(camera.position.distanceTo(center) / 2048))
    const currentLOD = Math.floor(Math.sqrt(camera.position.distanceTo(center) / MIN_ZOOM))

    const depth = Math.floor(Math.log(node.size / (CHUNK_SIZE / 2)))

    // if the desired LOD is lower than our current depth (chunks of size 256 are the highest zoom level, aka LOD 0)
    if (currentLOD < depth) {

        removeChunk()

        const newXOffset = node.xOffset * 2
        const newYOffset = node.yOffset * 2
        const newSize = node.size / 2

        if (node.ne !== undefined) {
            node.ne = updateTerrainTree(node.ne)
        } else {
            node.ne = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.nw !== undefined) {
            node.nw = updateTerrainTree(node.nw)
        } else {
            node.nw = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.se !== undefined) {
            node.se = updateTerrainTree(node.se)
        } else {
            node.se = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

        if (node.sw !== undefined) {
            node.sw = updateTerrainTree(node.sw)
        } else {
            node.sw = buildTree(newXOffset + 1, newYOffset + 1, newSize)
        }

    } else if (currentLOD === depth){

        if (node.chunk === undefined){

            removeChunk()
            updateChildren()

            let chunk = {}

            if (chunkIndex[node.xOffset]?.[node.yOffset]?.depth !== undefined) {
                chunk = chunkIndex[node.xOffset][node.yOffset][depth] // load previously-generated chunk
            } else {
                chunk = createGroundChunk(node.size, node.xOffset, node.yOffset, depth)
                indexChunk(chunk, node.xOffset, node.yOffset, depth)
            }

            scene.add(chunk)
            node.chunk = chunk
        }
    
    } else {
        removeChunk()
        updateChildren()
    }

    return node

}