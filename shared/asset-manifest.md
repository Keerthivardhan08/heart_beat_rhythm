# 3D asset manifest

Status: candidate review needed before final demo.

The integrated viewer must use a licensed anatomical model and must not imply patient-specific lesion geometry.

## Candidate sources

1. NIH 3D Heart Library
   - URL: https://3d.nih.gov/collections/heart-library
   - Notes: NIH 3D supports downloadable GLB for interactive web use, but licensing varies by model and must be checked per asset.

2. 3D Digital Model of Coronary Arteries by Jeslyn Poo Hwee Ming
   - URL: https://sketchfab.com/3d-models/3d-digital-model-of-coronary-arteries-cb63e7714a574984835160530957748b
   - Listed license: Creative Commons Attribution.
   - Notes: Good coronary-specific candidate if attribution and download terms are acceptable.

3. Innerscene Heart GLB
   - URL: https://www.innerscene.com/tools/library/3d-parts/heart-e9f72b0e
   - Listed license: CC0.
   - Notes: Good neutral base-heart candidate, but coronary vessel separation still needs verification.

## Required before replacing the schematic viewer

- Save the permitted GLB under `frontend/public/models/`.
- Record source URL, author, license, downloaded file name, and any modifications.
- Inspect mesh names for LAD, LCX and RCA.
- Update `shared/vessel-mapping.md` with verified mesh IDs.
- Keep UI wording as illustrative anatomy unless actual patient-specific imaging geometry is supplied.
