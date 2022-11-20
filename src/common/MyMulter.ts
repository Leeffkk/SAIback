import { Config } from '../config';
//Multer information 
const multer = require('multer')
export const MotionUpload = multer({ dest: Config.motionDir});