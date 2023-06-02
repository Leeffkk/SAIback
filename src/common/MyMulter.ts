import { Config, ProdConfig } from '../config';
//Multer information Motion

var config_to_use = Config;
if (process.env.NODE_ENV && process.env.NODE_ENV=="prod"){
    config_to_use = ProdConfig;
}

const filter = (req: any, file: { mimetype: string; }, cb: (arg0: Error | null, arg1: boolean | undefined) => void) => {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed!"), false);
    }
};

const multer = require('multer')
const storage = multer.memoryStorage();
export const LeadUpload = multer({ storage, fileFilter: filter });
export const MotionUpload = multer({ storage, fileFilter: filter });


// export const LeadUpload = multer({ dest: config_to_use.leadDir});
// export const MotionUpload = multer({ dest: config_to_use.motionDir});