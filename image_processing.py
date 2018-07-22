"""Image processing"""
import math
import numpy as np
from PIL import Image
import skimage.morphology
import skimage.transform
import sklearn.decomposition
import sklearn.preprocessing


def threshold(image, rgb):
    """Apply threshold on image on a per channel basis"""
    # split into 3 channels
    channels = image.split()
    # apply threshold
    resulting_channels = [
        channel.point(lambda p, thres=channel_threshold: p < thres)
        for channel, channel_threshold in zip(channels, rgb)
    ]
    # convert to numpy arrays
    resulting_channels = [np.asarray(channel)
                          for channel in resulting_channels]
    # get product
    return np.prod(resulting_channels, axis=0)


def inches_to_pixels(dpi, inches):
    """Convert inches to pixels with given DPI"""
    return dpi * inches


def filter_max_occurances(labeled, number_of_keys=4):
    """Filter max `number_of_keys` occurances"""
    unique, counts = np.unique(labeled, return_counts=True)
    stat = dict(zip(unique, counts))

    # index 0 (background) is not counted
    stat[0] = 0

    top_keys = sorted(unique, key=lambda e: stat[e], reverse=True)[:number_of_keys]
    print("Top %d keys: " % number_of_keys, top_keys, [stat[k] for k in top_keys])

    new_array = np.ndarray(labeled.shape)
    for i, k in enumerate(top_keys, 1):
        new_array[np.where(labeled == k)] = i

    return new_array


def filter_matrix(matrix, value):
    """Mask out part of matrix that has a value other than `value`"""
    new_matrix = matrix.copy()
    new_matrix[new_matrix != value] = 0

    return new_matrix


def rotate_points(coord_x, coord_y, rad):
    """Rotate a point or points in a numpy array"""
    new_x = coord_x * math.cos(rad) - coord_y * math.sin(rad)
    new_y = coord_x * math.sin(rad) + coord_y * math.cos(rad)

    return new_x, new_y


def find_maximas(coords_x, coords_y):
    """Find maxs and mins in xs and ys"""
    return {
        "x_max": coords_x.max(),
        "x_min": coords_x.min(),
        "y_max": coords_y.max(),
        "y_min": coords_y.min()
    }


def find_photos(input_image_name, dpi=600, height=3.5, width=5):
    """Find photos in input image"""
    threshold_color = [230, 230, 230]

    # open image
    image = Image.open(input_image_name)
    # define photo shape in pixels
    photo_shape = inches_to_pixels(
        dpi, max(width, height)), inches_to_pixels(dpi, min(width, height))

    # convert background pixels to False and the rest to True
    thr = threshold(image, threshold_color)
    casted_thr = thr.astype(bool)
    # assign labels to groups
    labeled = skimage.morphology.label(casted_thr, connectivity=2)

    # filter insignificant groups and keep the largest four
    filtered = filter_max_occurances(labeled)

    photos = []

    # for the most significant four groups
    for i in range(1, 5):
        print("Processing %d/%d" % (i, 4))
        # grab current group
        identified_pic = filter_matrix(filtered, i)
        pic_locations = np.transpose(np.where(identified_pic == i))

        hull = skimage.morphology.convex_hull_image(identified_pic)
        hull_locations = np.transpose(np.where(hull))

        max_pic_location = np.amax(pic_locations, axis=0)
        min_pic_location = np.amin(pic_locations, axis=0)
        center_pic_location = np.average(
            [min_pic_location, max_pic_location], axis=0)

        # find most significant component with PCA
        pca = sklearn.decomposition.PCA(n_components=2).fit(hull_locations)
        components = sklearn.preprocessing.normalize(pca.components_)
        comp_1, comp_2 = components

        comp_angle_1 = (np.arctan2(comp_1[1], comp_1[0]) + 0) % np.pi
        comp_angle_2 = (np.arctan2(comp_2[1], comp_2[0]) + np.pi / 2) % np.pi
        weighted_avg_angle = np.average(
            [comp_angle_1, comp_angle_2], weights=photo_shape)
        comp_1 = np.array(rotate_points(1, 0, weighted_avg_angle))
        comp_2 = np.array(rotate_points(1, 0, weighted_avg_angle + np.pi / 2))

        half_sized_comp_1 = comp_1 * photo_shape[0] / 2
        half_sized_comp_2 = comp_2 * photo_shape[1] / 2

        top_left_corner = center_pic_location + half_sized_comp_1 + half_sized_comp_2
        rotation_angle = np.arctan2(-half_sized_comp_2[0], -half_sized_comp_2[1])

        photos.append({
            "dimension": (photo_shape[1], photo_shape[0]),
            "top_left": (top_left_corner[1], top_left_corner[0]),  # coords in [x, y]
            "rotation": rotation_angle  # angle in rad
        })

    return photos


def crop_image(input_image, top_left, rotation, dimension):
    """Crop image given the transformation. Input describes a free bounding box over
    the input image.

    Args:
        input_image: Image
        top_left: top_left coordinates in pixels (x, y)
        rotation: rotation in radians
        dimensions: dimensions in pixels (x, y)

    Returns:
        numpy array: New image
    """
    transformation = np.array([
        [np.cos(-rotation), np.sin(-rotation), top_left[0]],
        [-np.sin(-rotation), np.cos(-rotation), top_left[1]],
    ])

    output_image = input_image.transform(dimension, Image.AFFINE, transformation.flatten())
    return output_image
