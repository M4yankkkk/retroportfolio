#!/usr/bin/env node
// Diagnostic: print the bounding box of the pcjr.glb model
// Run: node scripts/inspect-model.mjs

import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS)
const doc = await io.read('public/models/pcjr.glb')
const root = doc.getRoot()

let minX = Infinity, minY = Infinity, minZ = Infinity
let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity

for (const mesh of root.listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION')
    if (!pos) continue
    const arr = pos.getArray()
    for (let i = 0; i < arr.length; i += 3) {
      if (arr[i]   < minX) minX = arr[i]
      if (arr[i]   > maxX) maxX = arr[i]
      if (arr[i+1] < minY) minY = arr[i+1]
      if (arr[i+1] > maxY) maxY = arr[i+1]
      if (arr[i+2] < minZ) minZ = arr[i+2]
      if (arr[i+2] > maxZ) maxZ = arr[i+2]
    }
  }
}

const sizeX = maxX - minX
const sizeY = maxY - minY
const sizeZ = maxZ - minZ
const maxDim = Math.max(sizeX, sizeY, sizeZ)

console.log('=== PCjr Model Bounds ===')
console.log(`Min: (${minX.toFixed(3)}, ${minY.toFixed(3)}, ${minZ.toFixed(3)})`)
console.log(`Max: (${maxX.toFixed(3)}, ${maxY.toFixed(3)}, ${maxZ.toFixed(3)})`)
console.log(`Size: ${sizeX.toFixed(3)} x ${sizeY.toFixed(3)} x ${sizeZ.toFixed(3)}`)
console.log(`Largest dim: ${maxDim.toFixed(3)}`)
console.log()
// Target: model should fill ~1 unit in the largest dimension
const targetScale = 1.0 / maxDim
console.log(`Recommended scale to fit ~1 unit: ${targetScale.toFixed(5)}`)
console.log(`Recommended scale to fit ~1.5 units (desk-friendly): ${(1.5 / maxDim).toFixed(5)}`)
