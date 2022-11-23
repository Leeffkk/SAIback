from ServerCode import *
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('inputFile')
parser.add_argument('outputFile')
parser.add_argument('img_mod')
args = parser.parse_args()

prediction = obtain_prediction(args.inputFile, img_mod = args.img_mod)
cv.imwrite(args.outputFile, prediction)