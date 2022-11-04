import cv2
import math

img = cv2.imread("./resources/Godcrofts_HeightMap.png") # 512x512

img_shape = img.shape
tile_size = (256, 256)
offset = (256, 256)

x_size = int(math.ceil(img_shape[1]/(offset[0] * 1.0)))
y_size = int(math.ceil(img_shape[0]/(offset[1] * 1.0)))

for i in range(y_size):
    for j in range(x_size):
        x = j
        y = y_size - i - 1

        cropped_img = img[offset[1]*i:min(offset[1]*i+tile_size[1], img_shape[0]), offset[0]*j:min(offset[0]*j+tile_size[0], img_shape[1])]
        # Debugging the tiles
        cv2.imwrite("./output/" + str(x) + "_" + str(y) + ".png", cropped_img)