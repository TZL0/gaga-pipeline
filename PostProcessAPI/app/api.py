from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import bpy
import os
from pathlib import Path
import shutil
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

@app.get("/")
def read_root():
    return {"message": "Blender and FastAPI running in Docker"}

@app.get("/bpy")
def blender_version():
    return {"blender_version": bpy.app.version}

@app.post("/process_output")
def process_output():
    process_directory('../shared/output/.', '../shared/output_processed/.')

@app.post("/process_file")
async def process_file(file: UploadFile = File(...)):
    glb_bytes = await file.read()

    with tempfile.TemporaryDirectory() as temp_dir:
        temp_glb_path = os.path.join(temp_dir, 'temp.glb')
        with open(temp_glb_path, 'wb') as f:
            f.write(glb_bytes)
        
        temp_fbx_path = os.path.join(temp_dir, 'output.fbx')

        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete()

        bpy.ops.outliner.orphans_purge(do_recursive=True)

        for img in bpy.data.images:
            bpy.data.images.remove(img)
        
        bpy.ops.import_scene.gltf(filepath=temp_glb_path)

        saved_imgs = []
        for img in bpy.data.images:
            print(f'img.name_full: {img.name_full}')
            if img.name == 'Render Result' or img.name == 'Viewer Node':
                continue
            
            temp_path = os.path.join(temp_dir, img.name)
            if not temp_path.endswith(('.png', '.jpg', '.jpeg')):
                temp_path += '.png'
            
            img.save_render(temp_path)
            img.filepath = temp_path
            img.reload()
            
            saved_imgs.append(img.filepath)
            print(f'img.filepath: {img.filepath}')
        
        # for obj in bpy.context.scene.objects:
        #     print(f'obj.name_full: {obj.name_full}')
        #     if obj.type != 'MESH':
        #         continue

        #     for img in bpy.data.images:
        #         mat_name = f'Material_{img.name}'
        #         mat = bpy.data.materials.new(name=mat_name)
        #         mat.use_nodes = True
        #         nodes = mat.node_tree.nodes

        #         nodes.clear()

        #         principled = nodes.new('ShaderNodeBsdfPrincipled')
        #         tex_img = nodes.new('ShaderNodeTexImage')
        #         output = nodes.new('ShaderNodeOutputMaterial')

        #         tex_img.image = img

        #         links = mat.node_tree.links
        #         links.new(tex_img.outputs['Color'], principled.inputs['Base Color'])
        #         links.new(principled.outputs['BSDF'], output.inputs['Surface'])

        #         if obj.data.materials:
        #             obj.data.materials[0] = mat
        #         else:
        #             obj.data.materials.append(mat)
                
        #         print(f'mat_name: {mat_name}')
        #         break
        
        bpy.ops.export_scene.fbx(
            filepath=temp_fbx_path,
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

        with open(temp_fbx_path, 'rb') as f:
            fbx_bytes = base64.b64encode(f.read()).decode('utf-8')

        textures = []
        for saved_img_path in saved_imgs:
            with open(saved_img_path, 'rb') as f:
                textures.append(base64.b64encode(f.read()).decode('utf-8'))

        return JSONResponse({
            'fbx': fbx_bytes,
            'textures': textures
        })

def export_image_data(output_path, size=1024):
    for img in bpy.data.images:            
        if img.filepath:
            original_name = os.path.basename(img.filepath)
            file_extension = os.path.splitext(original_name)[1]
            original_name += file_extension
        else:
            original_name = img.name + '.png'
            
        image_path = os.path.join(output_path, original_name)
        
        if not img.packed_file:
            try:
                img.pack()
            except Exception as e:
                print(f"Could not pack {img.name}: {e}")
                continue
        
        try:
            img.save_render(image_path)
            print(f"Exported: {image_path}")
        except Exception as e:
            print(f"Failed to save {img.name}: {e}")

    return True

def convert_glb_to_fbx(input_path, output_path, export_images=True):
    for obj in bpy.data.objects:
        bpy.data.objects.remove(obj, do_unlink=True)
    for img in bpy.data.images:
        bpy.data.images.remove(img)
    
    bpy.ops.import_scene.gltf(filepath=input_path)
    
    output_dir = Path(output_path).parent
    if os.path.exists(output_dir):
        print(f"Clearing existing directory: {output_dir}")
        shutil.rmtree(output_dir)

    if export_images:
        try:
            if export_image_data(output_dir):
                print(f"Exported images: {output_dir}")
        except Exception as e:
            print(f"Error exporting images: {str(e)}")
    
    for obj in bpy.data.objects:
        obj.select_set(True)
    
    if bpy.data.objects:
        bpy.context.view_layer.objects.active = bpy.data.objects[0]
    
    bpy.ops.export_scene.fbx(
        filepath=output_path,
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
        add_leaf_bones=False,
        primary_bone_axis='Y',
        secondary_bone_axis='X',
        axis_forward='-Z',
        axis_up='Y'
    )

def process_directory(input_dir, output_dir, export_images=True):
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    for glb_file in input_path.rglob('*.glb'):
        try:
            relative_path = glb_file.relative_to(input_path)
            fbx_file = output_path / relative_path.with_suffix('.fbx')
            
            print(f"\nProcessing: {glb_file}")
            print(f"Output to: {fbx_file}")
            
            convert_glb_to_fbx(str(glb_file), str(fbx_file), export_images)
            
            print("Conversion successful!")
            
        except Exception as e:
            print(f"Error converting {glb_file}: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
