import cv2
import math

img = cv2.imread("./resources/Godcrofts_HeightMap.png") # 512x512

img_shape = img.shape
tile_size = (256, 256)
offset = (256, 256)

img_scale = 256

# x_size = int(math.ceil(img_shape[1]/(offset[0] * 1.0)))
# y_size = int(math.ceil(img_shape[0]/(offset[1] * 1.0)))

# for i in range(y_size):
#     for j in range(x_size):
#         x = j
#         y = y_size - i - 1

#         cropped_img = img[offset[1]*i:min(offset[1]*i+tile_size[1], img_shape[0]), offset[0]*j:min(offset[0]*j+tile_size[0], img_shape[1])]

#         if (cropped_img.shape[0] < img_scale or cropped_img.shape[1] < img_scale):
#             cropped_img = cv2.copyMakeBorder(cropped_img, 0, img_scale - cropped_img.shape[0], 0, img_scale - cropped_img.shape[1], cv2.BORDER_CONSTANT, None, value = 0)
        
#         # Debugging the tiles
#         cv2.imwrite("./output/" + str(x) + "_" + str(y) + ".png", cropped_img)

size = 256
z = 0

# generate tiles for all zoom levels (0 is full detail)
while (size < img_shape[1] or size < img_shape[0]):

    x_size = int(math.ceil(img_shape[1]/(size * 1.0)))
    y_size = int(math.ceil(img_shape[0]/(size * 1.0)))

    for i in range(y_size):
        for j in range(x_size):
            x = j
            y = y_size - i - 1

            # crop image within bounds
            cropped_img = img[size*i:min(size*i+size, img_shape[0]), size*j:min(size*j+size, img_shape[1])]

            # pad image
            if (cropped_img.shape[0] < size or cropped_img.shape[1] < size):
                cropped_img = cv2.copyMakeBorder(cropped_img, 0, size - cropped_img.shape[0], 0, size - cropped_img.shape[1], cv2.BORDER_CONSTANT, None, value = 0)
            
            resized = cv2.resize(cropped_img, (img_scale, img_scale), interpolation = cv2.INTER_AREA)
            cv2.imwrite("./quadmaps/" + str(x) + "_" + str(y) + "_" + str(z) + ".png", resized)

    z += 1
    size *= 2

