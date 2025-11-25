from PIL import Image
import os
import sys

def remove_black_background(image_path, output_path, tolerance=30):
    try:
        img = Image.open(image_path).convert("RGBA")
        datas = img.getdata()

        newData = []
        for item in datas:
            # Check if pixel is black (or close to black)
            if item[0] < tolerance and item[1] < tolerance and item[2] < tolerance:
                newData.append((255, 255, 255, 0))  # Transparent
            else:
                newData.append(item)

        img.putdata(newData)
        img.save(output_path, "PNG")
        print(f"Processed: {image_path} -> {output_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

if __name__ == "__main__":
    # Define mappings: source_filename -> (output_folder, output_filename)
    # Source files are in the artifacts directory
    artifacts_dir = "/Users/jwonkim/.gemini/antigravity/brain/0406d048-03f9-4a29-b328-8296a961b1bd"
    project_dir = "/Users/jwonkim/Workspace/gemtleMonster"
    
    mappings = {
        "slime_basic": ("public/assets/monsters", "slime_basic.png"),
        "hound_basic": ("public/assets/monsters", "hound_basic.png"),
        "herb_common": ("public/assets/materials", "herb_common.png"),
        "herb_rare": ("public/assets/materials", "herb_rare.png"),
        "herb_special": ("public/assets/materials", "herb_special.png"),
        "slime_core": ("public/assets/materials", "slime_core.png"),
        "beast_fang": ("public/assets/materials", "beast_fang.png")
    }

    # Find the latest generated file for each key
    # Since filenames have timestamps (e.g., slime_basic_123456.png), we need to find the match
    
    files = os.listdir(artifacts_dir)
    
    for key, (out_folder, out_name) in mappings.items():
        # Find files starting with key
        matches = [f for f in files if f.startswith(key) and f.endswith(".png")]
        if not matches:
            print(f"No source file found for {key}")
            continue
            
        # Get the latest one (assuming timestamp sort works alphabetically or we just take one)
        matches.sort(reverse=True)
        source_file = matches[0]
        source_path = os.path.join(artifacts_dir, source_file)
        
        output_dir = os.path.join(project_dir, out_folder)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        output_path = os.path.join(output_dir, out_name)
        
        remove_black_background(source_path, output_path)
