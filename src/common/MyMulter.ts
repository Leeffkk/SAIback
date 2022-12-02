import { Config } from '../config';
//Multer information Motion
const multer = require('multer')
export const LeadUpload = multer({ dest: Config.leadDir});