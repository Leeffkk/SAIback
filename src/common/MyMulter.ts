import { Config, ProdConfig } from '../config';
//Multer information Motion

var config_to_use = Config;
if (process.env.NODE_ENV && process.env.NODE_ENV=="prod"){
    config_to_use = ProdConfig;
}

const multer = require('multer')
export const LeadUpload = multer({ dest: config_to_use.leadDir});