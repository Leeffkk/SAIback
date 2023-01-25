#!/usr/bin/env python
# coding: utf-8

# python 3.8.3
# numpy 1.19.5
# argparse 1.1
# cv2 4.4.0
# matplotlib 3.5.1
# glob2 0.7
# sklearn 0.0

"""
Created Dec 15 2022

@author: kelskap@udel.edu
"""

import numpy as np
import argparse
import cv2
from matplotlib import pyplot as plt
import glob
from sklearn.neighbors import NearestNeighbors


def get_sift_kps(img,x,y,k,kp_size):
    
    kp = []
    for i in range(-k//2,k//2+1):
        for j in range(-k//2,k//2+1):
            kp.append(cv2.KeyPoint(x+i,y+j,kp_size))
    
    sift = cv2.xfeatures2d.SIFT_create()
    kp,des = sift.compute(img,kp)

    return kp,des


def match_kps(kp1,kp2,des1,des2):
    
    bf = cv2.BFMatcher(cv2.NORM_L1) # create BFMatcher object, default uses L2 Norm
    matches = bf.knnMatch(des1,des2,k=1) # k is number of matches to find
    
    p = kp2[matches[0][0].trainIdx].pt
    dist = matches[0][0].distance
    
    return p,dist


def get_sift_matches(img1,img2,k,kp_size,dist_threshold,step):

    grid = np.mgrid[k//2+kp_size//2:img1.shape[0]-k//2-kp_size//2:step,k//2+kp_size//2:img1.shape[1]-k//2-kp_size//2:step].reshape(2,-1).T
    
    kps1 = []
    for i in grid:
        kps1.append(cv2.KeyPoint(float(i[0]),float(i[1]),kp_size))
    
    sift = cv2.xfeatures2d.SIFT_create()
    kps1,des1 = sift.compute(img1,kps1)

    matches = []

    for i in range(len(kps1)):

        x,y = kps1[i].pt
        
        kps2,des2 = get_sift_kps(img2,x,y,k,kp_size)

        if (len(kps2) > 0):

            p,dist = match_kps(kps1[i:i+1],kps2,des1[i:i+1],des2)

            if (dist < dist_threshold):
                matches.append([x,y,p[0],p[1]])
    
    return np.asarray(matches)


def get_outliers(matches,ang_threshold,mag_threshold,count_threshold):
    
    outliers = []

    for i in range(matches.shape[0]):

        m1 = matches[i]
        mag1 = np.linalg.norm([(m1[2] - m1[0]),(m1[3] - m1[1])])
        angle1 = np.angle((m1[2] - m1[0]) + (1j)*(m1[3]-m1[1]), deg=True)

        nbrs = NearestNeighbors(n_neighbors=10, algorithm='ball_tree').fit(matches[:,:])
        distances, indices = nbrs.kneighbors(matches)

        ms = []
        for j in indices[i]:
            if j != i:
                ms.append(matches[j])

        outlier = False
        outlier_count = 0
        for m in ms:

            mag = np.linalg.norm([(m[2] - m[0]),(m[3] - m[1])])
            angle = np.angle((m[2] - m[0]) + (1j)*(m[3]-m[1]), deg=True)

            if (abs(angle-angle1) > ang_threshold or abs(mag-mag1) > mag_threshold):
                outlier_count += 1
                if outlier_count >= count_threshold:
                    outlier = True

            if outlier:
                outliers.append(m1)
                break;

    matches = matches[~((matches[:,None,:] == outliers).all(-1)).any(1)]
    
    return matches


def farneback(img1,img2):

    gray1 = cv2.cvtColor(img1.copy(), cv2.COLOR_RGB2GRAY)
    gray2 = cv2.cvtColor(img2.copy(), cv2.COLOR_RGB2GRAY)
    
    flow = cv2.calcOpticalFlowFarneback(gray1, gray2, None, 0.5, 3, 15, 3, 5, 1.2, 0)
    
    return flow


def scale_vectors(scale,u,v):
    
    dx,dy = scale,scale
    fx,fy = u[::dx,::dx],v[::dy,::dy]
    NX,NY = fx.shape[0],fy.shape[0]

    x = np.array([float(i)*dx for i in range(NX)])
    y = np.array([float(i)*dy for i in range(NY)])
    
    xx,yy = np.meshgrid(x, y, indexing = 'ij', sparse = False)
    
    return xx,yy,fx,fy


def estimate_motion(img1,img2):

    matches = get_sift_matches(img1,img2,k,kp_size,dist_threshold,step)
    matches = get_outliers(matches,ang_threshold,mag_threshold,count_threshold)
    
    flow = farneback(img1, img2)

    for m in matches:

        m = m.astype(int)
        
        a = 35
        flow2 = farneback(img1[m[1]-a:m[1]+a,m[0]-a:m[0]+a], img2[m[3]-a:m[3]+a,m[2]-a:m[2]+a])

        b = 25
        flow[m[1]-b-1:m[1]+b,m[0]-b-1:m[0]+b,0] = flow2[a-b-1:a+b,a-b-1:a+b,0]+(m[2]-m[0])
        flow[m[1]-b-1:m[1]+b,m[0]-b-1:m[0]+b,1] = flow2[a-b-1:a+b,a-b-1:a+b,1]+(m[3]-m[1])

    u = flow[:,:,1]
    v = flow[:,:,0]
    
    return u,v


def display(img1,u,v,scale,output_path):
    
    xx,yy,fx,fy = scale_vectors(scale,u,v)
    
    plt.figure(figsize=(12,12))
    plt.imshow(img1)
    plt.quiver(yy,xx,fy,fx,color='b',angles='xy',scale_units='xy',scale=1)
    plt.savefig(output_path)


def main(img1_path,img2_path,output_path):
    
    # parameters
    # k = 100
    # kp_size = 9
    # dist_threshold = 2000
    # step = 400#25
    # ang_threshold = 100
    # mag_threshold = 10
    # count_threshold = 3
    # scale = 16

    img1 = cv2.imread(img1_path)
    img2 = cv2.imread(img2_path)
    u,v = estimate_motion(img1,img2)
    display(img1,u,v,scale,output_path)

# parameters
k = 100
kp_size = 9
dist_threshold = 2000
step = 400#25
ang_threshold = 100
mag_threshold = 10
count_threshold = 3
scale = 16


parser = argparse.ArgumentParser()
parser.add_argument('inputFile1')
parser.add_argument('inputFile2')
parser.add_argument('outputFile')
args = parser.parse_args()

im1='20210307_032837_DVWF_HH_8bit_20m.tif'
im2='20210309_160619_DVWF_HH_8bit_20m.tif'
main(args.inputFile1,args.inputFile2,args.outputFile)