# PLACE YOUR pcjr.glb HERE

This directory expects the file: `pcjr.glb`

## How to obtain and optimize it

1. Download the IBM PCjr GLB from Sketchfab/Fab:
   - Choose the **GLB, 1k texture** variant (~25MB)

2. Place the raw file here as: `pcjr-raw.glb`

3. Run the optimization script from the project root:
   ```bash
   npm run optimize-model
   ```
   This runs:
   ```
   npx @gltf-transform/cli@latest optimize public/models/pcjr-raw.glb public/models/pcjr.glb --compress draco --texture-compress webp
   ```
   Target: **under 5MB**

4. Verify the result at https://gltf.report/ before deploying.

## Enabling in the Scene

Once `pcjr.glb` is present, open `src/components/Scene.jsx` and:
- Uncomment line 8: `import PCjr from './PCjr'`
- Replace `<PCjrPlaceholder>` with `<PCjr>` at line ~145

## Draco Decoder

drei's `useGLTF(path, true)` automatically fetches the Draco decoder from CDN.
For offline/self-hosted builds, copy Draco decoder files to `public/draco/` and configure:
```js
useGLTF.setDecoderPath('/draco/')
```
