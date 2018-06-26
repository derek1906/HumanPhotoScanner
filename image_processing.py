import math
import numpy as np
import numpy.linalg as la
from PIL import Image
from functional import seq
import skimage.morphology
import skimage.transform
import sklearn.decomposition


class _obj(object):
    def __init__(self, v):
        self.value = v

    @classmethod
    def enc(cls, func):
        def _(*inputs):
            output = func(
                *list(i.value if isinstance(i, _obj) else i for i in inputs))
            return _obj(output)
        return _


def threshold(image, rgb):
    channels = image.split()

    result = (
        seq(channels)
        .zip(rgb)
        .map(_obj.enc(lambda v: v[0].point(lambda p: int(p < v[1]))))
        .map(_obj.enc(np.asarray))
        .reduce(_obj.enc(lambda c1, c2: c1 * c2))
    )

    return result.value


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


def compute_center_and_rotation(raw_image, photo_shape, x, y, basis):
    angle = angle_between(np.array([1, 0]), np.array(basis))
    rotated_points = rotate_points(x, y, -angle)
    maximas = find_maximas(*rotated_points)

    cx = (maximas["x_max"] + maximas["x_min"]) / 2
    cy = (maximas["y_max"] + maximas["y_min"]) / 2
    
    return {
        "center": {
            "x": cx,
            "y": cy,
        },
        "rotation": angle
    }


def compute_windows(input_image, dpi=600, width=3.5, height=5):
    threshold_color = [230, 230, 230]

    # open image
    image = Image.open(input_image)
    # define photo shape in pixels
    photo_shape = inches_to_pixels(dpi, width), inches_to_pixels(dpi, height)

    # convert background pixels to False and the rest to True
    thr = threshold(image, threshold_color)
    casted_thr = thr.astype(bool)
    # assign labels to groups
    labeled = skimage.morphology.label(casted_thr, connectivity=2)

    # filter insignificant groups and keep the largest four
    filtered = filter_max_occurances(labeled)

    hack = image.rotate(180)

    groups = []

    # for the most significant four groups
    for i in range(1, 5):
        # filter out pixels that are not in the current group
        pic_locations = np.where(filtered == i)

        # find most significant component with PCA
        pca = sklearn.decomposition.PCA(
            n_components=2).fit(np.transpose(pic_locations))
        components = pca.components_
        comp_1, _ = components
        # normalize basis
        if comp_1[0] < 0 and comp_1[1] > 0:
            comp_1[0] *= -1
            comp_1[1] *= -1

        # grab center and rotation
        details = compute_center_and_rotation(hack, photo_shape, pic_locations[1], pic_locations[0], comp_1)
        details.update({
            "dimension": {
                "x": photo_shape[0],
                "y": photo_shape[1]
            }
        })
        groups.append(details)

    return groups
