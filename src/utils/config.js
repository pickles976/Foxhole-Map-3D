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

export const PLANE_SEGMENTS = 128