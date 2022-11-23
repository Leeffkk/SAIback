import torch.nn as nn
import torch
import numpy as np
import os
import cv2 as cv
import torchvision
import matplotlib
import matplotlib.pyplot as plt
from torchvision import transforms
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms, utils
import scipy.io as io
import glob
import torch.nn.functional as F
from PIL import Image
import PIL
import random
import time
import sys
from patchify import patchify, unpatchify
import random
import pandas as pd
from PIL import Image, ImageOps
from torch.nn import init
import math
import copy
from sklearn.cluster import KMeans
from einops.layers.torch import Reduce, Rearrange

## U-NET MODEL AND ITS COMPONENTS ##

class DoubleConv(nn.Module):
	"""(convolution => [BN] => ReLU) * 2"""

	def __init__(self, in_channels, out_channels, kernel_size = 3, mid_channels=None):
		super().__init__()
		if not mid_channels:
			mid_channels = out_channels
		self.double_conv = nn.Sequential(
			nn.Conv2d(in_channels, mid_channels, kernel_size= kernel_size, padding=kernel_size//2, dilation=1),
			nn.BatchNorm2d(mid_channels),
			nn.ReLU(inplace=True),
			nn.Conv2d(mid_channels, out_channels, kernel_size= kernel_size, padding=kernel_size//2, dilation=1),
			nn.BatchNorm2d(out_channels),
			nn.ReLU(inplace=True)
		)

	def forward(self, x):
		return self.double_conv(x)


class Down(nn.Module):
	"""Downscaling with maxpool then double conv"""

	def __init__(self, in_channels, out_channels, kernel_size = 3):
		super().__init__()
		self.maxpool_conv = nn.Sequential(
			nn.MaxPool2d(2),
			DoubleConv(in_channels, out_channels, kernel_size)
		)

	def forward(self, x):
		return self.maxpool_conv(x)


class Up(nn.Module):
	"""Upscaling then double conv"""

	def __init__(self, in_channels, out_channels, kernel_size = 3, bilinear=True):
		super().__init__()

		# if bilinear, use the normal convolutions to reduce the number of channels
		if bilinear:
			self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
			self.conv = DoubleConv(in_channels, out_channels, kernel_size, in_channels // 2)
		else:
			self.up = nn.ConvTranspose2d(in_channels , in_channels // 2, kernel_size=2, stride=2)
			self.conv = DoubleConv(in_channels, out_channels, kernel_size)


	def forward(self, x1, x2):
		x1 = self.up(x1)
		# input is CHW
		diffY = x2.size()[2] - x1.size()[2]
		diffX = x2.size()[3] - x1.size()[3]

		x1 = F.pad(x1, [diffX // 2, diffX - diffX // 2,
						diffY // 2, diffY - diffY // 2])
		x = torch.cat([x2, x1], dim=1)
		return self.conv(x)


class OutConv(nn.Module):
	def __init__(self, in_channels, out_channels):
		super(OutConv, self).__init__()
		self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)

	def forward(self, x):
		return self.conv(x)

class UNet(nn.Module):
	def __init__(self, n_channels, n_classes, bilinear=True):
		super(UNet, self).__init__()
		self.n_channels = n_channels
		self.n_classes = n_classes
		self.bilinear = bilinear

		self.inc = DoubleConv(n_channels, 64)
		self.down1 = Down(64, 128)
		self.down2 = Down(128, 256)
		self.down3 = Down(256, 512)
		factor = 2 if bilinear else 1
		self.down4 = Down(512, 1024 // factor)
		self.up1 = Up(1024, 512 // factor, bilinear)
		self.up2 = Up(512, 256 // factor, bilinear)
		self.up3 = Up(256, 128 // factor, bilinear)
		self.up4 = Up(128, 64, bilinear)
		self.outc = OutConv(64, n_classes)

	def forward(self, x):
		x1 = self.inc(x)
		x2 = self.down1(x1)
		x3 = self.down2(x2)
		x4 = self.down3(x3)
		x5 = self.down4(x4)

		x = self.up1(x5, x4)
		x = self.up2(x, x3)
		x = self.up3(x, x2)
		x = self.up4(x, x1)

		logits = self.outc(x)
		return logits

## INPUT IMAGE TYPE AND THEIR CORRESPONDING CHECKPOINTS ##

## Accepted img_modalities = ['WorldView', 'RadarSAT', 'GPRI'] ## Items in the drop-down list that we talked about

def get_patches(img, dim = 512, mod = None):
	img = cv.imread(img)
	h, w, c = img.shape
	if (h < dim) or (w < dim) or (mod == 'GPRI'):
		if mod == 'GPRI':
			img = cv.cvtColor(img, cv.COLOR_BGR2RGB)
		return img, h, w, None, None
	h_res = h % dim
	w_res = w % dim
	f_img = cv.resize(img, (w - w_res, h - h_res), interpolation=cv.INTER_CUBIC)
	f_img_patches = patchify(f_img, (dim, dim, 3), step = dim)
	return f_img_patches, h, w, h_res, w_res
	
def get_patch_predictions(f_img_patches, h, w, h_res, w_res, model):
	dim = 512
	tr = transforms.Compose([transforms.Resize((dim, dim)), transforms.ToTensor()])
	nc, ns, s, h_, w_, _ = f_img_patches.shape
	patched_image = np.zeros((nc, ns, s, h_, w_, 1), dtype = int)
	for i in range(1, f_img_patches.shape[0] + 1):
		for j in range(1, f_img_patches.shape[1] + 1):
			torch_img = tr(Image.fromarray(f_img_patches[i - 1 , j - 1, 0, :, :, :])).unsqueeze(0).cuda()
			res = torch.sigmoid(model(torch_img))
			patched_image[i - 1, j - 1, 0, :, :, :] = (res * 255).int().squeeze(0).permute(1, 2, 0).cpu().detach().numpy()
	patched_image = unpatchify(patched_image, [h - h_res, w - w_res, 1])
	res = cv.resize((patched_image).astype(np.uint8), (w, h), interpolation = cv.INTER_LINEAR)
	return res

def get_model_and_checkpoint(img_mod, model = 'U-Net'):

	if model == 'U-Net':
		model = UNet(3, 1)
	device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
	model.to(device)

	if img_mod == 'WorldView':
		checkpoint = torch.load('./ServerCheckpoints/DSalient15.pt')
	elif img_mod == 'RadarSAT':
		checkpoint = torch.load('./ServerCheckpoints/RadarSATAgain30.pt')
	elif img_mod == 'GPRI':
		checkpoint = torch.load('./ServerCheckpoints/GPRIUFLM90.pt')
	else:
		raise NotImplementedError

	model.load_state_dict(checkpoint['model_state_dict'])
	model.eval()

	return model

def obtain_prediction(img, model = 'U-Net', img_mod = 'WorldView'):
	patches, h, w, h_res, w_res = get_patches(img, mod = img_mod)
	model = get_model_and_checkpoint(img_mod, model)
	if h_res is not None:
		prediction = get_patch_predictions(patches, h, w, h_res, w_res, model)
	else:
		tr = transforms.Compose([transforms.Resize((512, 512)), transforms.ToTensor()])
		torch_img = tr(Image.fromarray(patches)).unsqueeze(0).cuda()
		prediction = torch.sigmoid(model(torch_img)).squeeze(0).permute(1, 2, 0).cpu().detach().numpy()
		prediction = cv.resize((prediction * 255).astype(np.uint8), (w, h), interpolation = cv.INTER_LINEAR)

	return prediction
