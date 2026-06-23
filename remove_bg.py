import sys
from PIL import Image
from rembg import remove

def process(file_path):
    print(f"Processing {file_path}...")
    try:
        img = Image.open(file_path)
        out = remove(img)
        out.save(file_path)
        print(f"Done {file_path}")
    except Exception as e:
        print(f"Error on {file_path}: {e}")

if __name__ == "__main__":
    for path in sys.argv[1:]:
        process(path)
