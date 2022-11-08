
// Text Y offset
export const TEXT_Y = 512

// Text size
export const TEXT_SIZE = 100

// height of the hex outlines
export const HEX_HEIGHT = 100

// How many vertices on each edge of the plane.
export const PLANE_SEGMENTS = 128

// Quadtree closest zoom level (higher means more detail when zoomed out)
export const MIN_ZOOM = 768

/**
 * CONSTANTS
 * DO NOT CHANGE THESE UNLESS YOU HAVE MODIFIED THE TILEMAP
 */

// true hex sizes
export const HEX_H = 1900
export const HEX_W = 2197

// true map size
export const RATIO = 1.1021839
const MAP_H = HEX_H * 7
const MAP_W = HEX_H / RATIO

// 3D map size
export const MAP_SIZE = 16384

// (IMAGE_H / MAP_H) * (MAP_SIZE / IMAGE_H) -> IMAGE_H drops out
export const SCALE = MAP_SIZE / MAP_H

// Quadtree minimum chunk size
export const CHUNK_SIZE = 256