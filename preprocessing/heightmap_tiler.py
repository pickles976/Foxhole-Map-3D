import cv2
import math

img = cv2.imread("./resources/map_topography.png", cv2.IMREAD_GRAYSCALE)
desired_size = 16384

img_scale = 128
size = 256

# # scale to desired size
x_scale = desired_size / img.shape[0] 
img = cv2.resize(img, (round(img.shape[1] * x_scale), 16384), interpolation = cv2.INTER_AREA)

# pad original
img = cv2.copyMakeBorder(img, 0, max(desired_size - img.shape[0], 0), 0, max(desired_size - img.shape[1], 0), cv2.BORDER_CONSTANT, None, value=0)
img = img[0:desired_size, 0:desired_size]

cv2.imwrite("./quadmaps/padded.png", img)

# generate tiles for all zoom levels (0 is full detail)
while (size <= img.shape[1] or size <= img.shape[0]):

    x_size = int(math.ceil(img.shape[1]/(size * 1.0)))
    y_size = int(math.ceil(img.shape[0]/(size * 1.0)))

    for i in range(y_size):
        for j in range(x_size):
            x = j
            y = y_size - i - 1

            # crop image within bounds
            cropped_img = img[size*i:min(size*i+size, img.shape[0]), size*j:min(size*j+size, img.shape[1])]

            # pad image
            if (cropped_img.shape[0] < size or cropped_img.shape[1] < size):
                cropped_img = cv2.copyMakeBorder(cropped_img, 0, size - cropped_img.shape[0], 0, size - cropped_img.shape[1], cv2.BORDER_CONSTANT, None, value = 0)
            
            resized = cv2.resize(cropped_img, (img_scale, img_scale), interpolation = cv2.INTER_AREA)
            cv2.imwrite("./quadmaps/" + str(x) + "_" + str(y) + "_" + str(size) + ".png", resized)

    size *= 2

