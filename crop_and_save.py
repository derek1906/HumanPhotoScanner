import sys
import math
import numpy as np
import numpy.linalg as la
from PIL import ImageFile, Image
import skimage.morphology
import skimage.transform
import sklearn.decomposition
import sklearn.preprocessing
import matplotlib.pyplot as plt


def threshold(image, rgb):
    # split into 3 channels
    channels = image.split()
    # apply threshold
    resulting_channels = [
        channel.point(lambda p, thres=channel_threshold: p < thres)
        for channel, channel_threshold in zip(channels, rgb)
    ]
    # convert to numpy arrays
    resulting_channels = [np.asarray(channel) for channel in resulting_channels]
    # get product
    return np.prod(resulting_channels, axis=0)

def inches_to_pixels(dpi, inches):
    return dpi * inches

def angle_between(v1, v2):
    """ Returns the angle in radians between vectors 'v1' and 'v2' """
    cosang = np.dot(v1, v2)
    sinang = la.norm(np.cross(v1, v2))
    return np.arctan2(sinang, cosang)

def rad_to_deg(rad):
    return rad * 180 / math.pi

def filter_max_occurances(labeled):
    unique, counts = np.unique(labeled, return_counts=True)
    stat = dict(zip(unique, counts))

    # index 0 (background) is not counted
    stat[0] = 0

    top_four_keys = sorted(unique, key=lambda e: stat[e], reverse=True)[:4]
    print(top_four_keys, [stat[k] for k in top_four_keys])

    new_array = np.ndarray(labeled.shape)
    for i, k in enumerate(top_four_keys, 1):
        new_array[np.where(labeled == k)] = i

    return new_array

def filter_matrix(matrix, value):
    new_matrix = matrix.copy()
    new_matrix[new_matrix != value] = 0

    return new_matrix

def rotate_points(x, y, rad):
    new_x = x * math.cos(rad) - y * math.sin(rad)
    new_y = x * math.sin(rad) + y * math.cos(rad)

    return new_x, new_y

def find_maximas(xs, ys):
    return {
        "x_max": xs.max(),
        "x_min": xs.min(),
        "y_max": ys.max(),
        "y_min": ys.min()
    }

def crop_and_save(raw_image, file_name, photo_shape, x, y, basis):
    angle = angle_between(np.array([1, 0]), np.array(basis))
    rotated_points = rotate_points(x, y, -angle)
    maximas = find_maximas(*rotated_points)

    cx = (maximas["x_max"] + maximas["x_min"]) / 2
    cy = (maximas["y_max"] + maximas["y_min"]) / 2
    raw_center_x = raw_image.size[0] / 2
    raw_center_y = raw_image.size[1] / 2

    cx, cy = rotate_points(cx, cy, angle)

    print(file_name, cx, cy)

    translated_image = raw_image.transform(raw_image.size, Image.AFFINE, (1, 0, raw_center_x - cx, 0, 1, raw_center_y - cy))
    rotated_image = translated_image.rotate(rad_to_deg(angle))

    cropped_image = rotated_image.crop((
        raw_center_x - photo_shape[0] / 2,
        raw_center_y - photo_shape[1] / 2,
        raw_center_x + photo_shape[0] / 2,
        raw_center_y + photo_shape[1] / 2
    ))

    cropped_image.save(file_name)


def main(input_image_name, dpi=600, height=3.5, width=5):
    threshold_color = [230, 230, 230]

    # open image
    image = Image.open(input_image_name)
    # define photo shape in pixels
    photo_shape = inches_to_pixels(dpi, max(width, height)), inches_to_pixels(dpi, min(width, height))

    # convert background pixels to False and the rest to True
    thr = threshold(image, threshold_color)
    casted_thr = thr.astype(bool)
    # assign labels to groups
    labeled = skimage.morphology.label(casted_thr, connectivity=2)

    # filter insignificant groups and keep the largest four
    filtered = filter_max_occurances(labeled)

    plt.imshow(image)

    # for the most significant four groups
    for i in range(1, 5):
        print("Processing %d/%d" % (i, 4))
        # grab current group
        identified_pic = filtered.copy()
        identified_pic[identified_pic != i] = 0
        pic_locations = np.transpose(np.where(identified_pic == i))

        hull = skimage.morphology.convex_hull_image(identified_pic)
        hull_locations = np.transpose(np.where(hull))

        max_pic_location = np.amax(pic_locations, axis=0)
        min_pic_location = np.amin(pic_locations, axis=0)
        center_pic_location = np.average([min_pic_location, max_pic_location], axis=0)

        # plt.plot(hull_locations[:, 1],
        #          hull_locations[:, 0], '-', lw=2, alpha=.3)
        plt.plot(center_pic_location[1], center_pic_location[0], 'o', lw=10)

        # find most significant component with PCA
        pca = sklearn.decomposition.PCA(n_components=2).fit(hull_locations)
        components = sklearn.preprocessing.normalize(pca.components_)
        comp_1, comp_2 = components

        comp_angle_1 = (np.arctan2(comp_1[1], comp_1[0]) + 0) % np.pi
        comp_angle_2 = (np.arctan2(comp_2[1], comp_2[0]) + np.pi / 2) % np.pi
        weighted_avg_angle = np.average([comp_angle_1, comp_angle_2], weights=photo_shape)
        comp_1 = np.array(rotate_points(1, 0, weighted_avg_angle))
        comp_2 = np.array(rotate_points(1, 0, weighted_avg_angle + np.pi / 2))

        half_sized_comp_1 = comp_1 * photo_shape[0] / 2
        half_sized_comp_2 = comp_2 * photo_shape[1] / 2

        corner_1 = center_pic_location + half_sized_comp_1 + half_sized_comp_2
        corner_2 = center_pic_location + half_sized_comp_1 - half_sized_comp_2
        corner_3 = center_pic_location - half_sized_comp_1 - half_sized_comp_2
        corner_4 = center_pic_location - half_sized_comp_1 + half_sized_comp_2

        corners = np.array([corner_1, corner_2, corner_3, corner_4])

        plt.plot(corners[:,1], corners[:,0], 'x', lw=1)
        plt.plot([center_pic_location[1], center_pic_location[1] + half_sized_comp_1[1]],
                 [center_pic_location[0], center_pic_location[0] + half_sized_comp_1[0]],
                 'r-')
        plt.plot([center_pic_location[1], center_pic_location[1] + half_sized_comp_2[1]],
                 [center_pic_location[0], center_pic_location[0] + half_sized_comp_2[0]],
                 'b-')
        plt.text(center_pic_location[1], center_pic_location[0], str(i), fontsize=12)

        print(weighted_avg_angle * 180 / np.pi)

        top_left_corner = center_pic_location + half_sized_comp_1 + half_sized_comp_2
        top_right_corner = center_pic_location + half_sized_comp_1 - half_sized_comp_2
        rotation_angle = np.arctan2(-half_sized_comp_2[0], -half_sized_comp_2[1])

        print("Top left:", top_left_corner)
        print("Top right:", top_right_corner)

        plt.plot(top_left_corner[1], top_left_corner[0], 'ro', lw=10)
        plt.plot(top_right_corner[1], top_right_corner[0], 'bo', lw=10)
        plt.text(top_right_corner[1], top_right_corner[0], "%.2f" % (rotation_angle * 180 / np.pi), fontsize=12)

        print(half_sized_comp_2)

        continue

        transformation = np.array([
            [ np.cos(np.pi / 4), np.sin(np.pi / 4), top_left_corner[1]],
            [-np.sin(np.pi / 4), np.cos(np.pi / 4), top_left_corner[0]],
        ])

        print(transformation)

        processed_image = image.transform(
            image.size, Image.AFFINE, transformation.flatten())
        plt.imshow(processed_image)
        plt.show()


    plt.show()

if __name__ == "__main__":
    main(*sys.argv[1:]) # pylint: disable=E1120
