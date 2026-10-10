import os
from PIL import Image

try:
    img = Image.open('C:/Users/Carmy/.gemini/antigravity-ide/brain/4d2767d1-1eea-4565-bdd1-95a77605f9f6/.user_uploaded/media_1791627811107.jpg')
    img = img.convert("RGBA")
    datas = img.getdata()

    new_data = []
    for item in datas:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    os.makedirs('c:/Users/Carmy/Documents/Movelingo/apps/web/public', exist_ok=True)
    img.save('c:/Users/Carmy/Documents/Movelingo/apps/web/public/mascot.png', "PNG")
    print("Done!")
except Exception as e:
    print(f"Error: {e}")
