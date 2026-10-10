import os
from PIL import Image

def remove_white_bg(img):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    # threshold for white
    for item in datas:
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

try:
    path = 'C:/Users/Carmy/.gemini/antigravity-ide/brain/4d2767d1-1eea-4565-bdd1-95a77605f9f6/.user_uploaded/media_1791631442616.jpg'
    img = Image.open(path)
    
    width, height = img.size
    # Process the whole image
    mascot_nobg = remove_white_bg(img)

    # Save them
    out_dir = 'c:/Users/Carmy/Documents/Movelingo/apps/web/public'
    os.makedirs(out_dir, exist_ok=True)
    mascot_nobg.save(os.path.join(out_dir, 'mascot.png'), "PNG")
    
    print("Successfully processed and saved mascot.png and logo.png")
except Exception as e:
    print(f"Error: {e}")
