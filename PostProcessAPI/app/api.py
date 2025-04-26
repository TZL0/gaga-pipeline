from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import bpy
import os
import tempfile
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev/testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process_file")
async def process_file(file: UploadFile = File(...)):
    glb_bytes = await file.read()

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_glb_path = os.path.join(temp_dir, 'input.glb')
        with open(temp_glb_path, 'wb') as f:
            f.write(glb_bytes)
        temp_fbx_path = os.path.join(temp_dir, 'output.fbx')

        reset_scene()
        bpy.ops.import_scene.gltf(filepath=temp_glb_path)

        textures = export_textures(temp_dir)
        fbx = export_fbx(temp_fbx_path)

        return JSONResponse({
            'fbx': fbx,
            'textures': textures
        })

def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

    bpy.ops.outliner.orphans_purge(do_recursive=True)

    for img in bpy.data.images:
        bpy.data.images.remove(img)

def export_textures(dir: str) -> list[str]:
    result = []
    for img in bpy.data.images:
        print(f'img.name_full: {img.name_full}')
        if img.name == 'Render Result' or img.name == 'Viewer Node':
            continue
        
        temp_path = os.path.join(dir, img.name)
        if not temp_path.endswith(('.png', '.jpg', '.jpeg')):
            temp_path += '.png'
        
        img.save_render(temp_path)
        img.filepath = temp_path
        img.reload()
        print(f'img.filepath: {img.filepath}')

        with open(temp_path, 'rb') as f:
            result.append(base64.b64encode(f.read()).decode('utf-8'))

    return result

def export_fbx(filepath: str) -> str:
    bpy.ops.export_scene.fbx(
        filepath=filepath,
        use_selection=False,
        global_scale=1.0,
        apply_unit_scale=True,
        bake_space_transform=True,
        object_types={'ARMATURE', 'MESH'},
        use_mesh_modifiers=True,
        mesh_smooth_type='OFF',
        use_mesh_edges=False,
        use_tspace=False,
        use_custom_props=False,
        path_mode='COPY',
        embed_textures=True,
        add_leaf_bones=False,
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        axis_forward='-Z',
        axis_up='Y'
    )

    with open(filepath, 'rb') as f:
        return base64.b64encode(f.read()).decode('utf-8')

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
