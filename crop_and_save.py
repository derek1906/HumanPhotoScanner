import sys
import math
import numpy as np
import numpy.linalg as la
from PIL import Image
from functional import seq
import skimage.morphology
import skimage.transform
import sklearn.decomposition
import matplotlib.pyplot as plt


class obj(object):
    def __init__(self, v):
        self.value = v

    @classmethod
    def enc(cls, func):
        def _(*inputs):
            output = func(*list(i.value if isinstance(i, obj) else i for i in inputs))
            return obj(output)
        return _

def threshold(image, rgb):
    channels = image.split()

    result = (
        seq(channels)
        .zip(rgb)
        .map(obj.enc(lambda v: v[0].point(lambda p: int(p < v[1]))))
        .map(obj.enc(np.asarray))
        .reduce(obj.enc(lambda c1, c2: c1 * c2))
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
    photo_shape = inches_to_pixels(dpi, height), inches_to_pixels(dpi, width)

    # convert background pixels to False and the rest to True
    thr = threshold(image, threshold_color)
    casted_thr = thr.astype(bool)
    # assign labels to groups
    labeled = skimage.morphology.label(casted_thr, connectivity=2)

    # filter insignificant groups and keep the largest four
    filtered = filter_max_occurances(labeled)

    # pic1 = filter_matrix(filtered, 3)
    # plt.matshow(pic1)

    hack = image.rotate(180)

    # for the most significant four groups
    for i in range(1, 5):
        # filter out pixels that are not in the current group
        pic_locations = np.where(filtered == i)

        # find most significant component with PCA
        pca = sklearn.decomposition.PCA(n_components=2).fit(np.transpose(pic_locations))
        components = pca.components_
        comp_1, _ = components
        # normalize basis
        if comp_1[0] < 0 and comp_1[1] > 0:
            comp_1[0] *= -1
            comp_1[1] *= -1

        print(i, comp_1)
        # crop and save image
        crop_and_save(hack, "image2_%d.jpg" % i, photo_shape,
                      pic_locations[1], pic_locations[0], comp_1)

    plt.show()

if __name__ == "__main__":
    main(*sys.argv[1:]) # pylint: disable=E1120
