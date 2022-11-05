import cv2
import math

img = cv2.imread("./resources/Godcrofts_HeightMap.png") # 512x512

img_shape = img.shape

img_scale = 128
size = 256

desired_size = 4096
# pad original
img = cv2.copyMakeBorder(img, 0, desired_size - img_shape[0], 0, desired_size - img_shape[1], cv2.BORDER_CONSTANT, None, value = 0)

cv2.imwrite("./quadmaps/padded.png", img)

# generate tiles for all zoom levels (0 is full detail)
while (size <= img_shape[1] or size <= img_shape[0]):

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
            cv2.imwrite("./quadmaps/" + str(x) + "_" + str(y) + "_" + str(size) + ".png", resized)

    size *= 2

