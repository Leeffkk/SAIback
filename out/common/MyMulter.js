"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionUpload = exports.LeadUpload = void 0;
var config_1 = require("../config");
//Multer information Motion
var config_to_use = config_1.Config;
if (process.env.NODE_ENV && process.env.NODE_ENV == "prod") {
    config_to_use = config_1.ProdConfig;
}
var filter = function (req, file, cb) {
    if (file.mimetype.split("/")[0] === 'image') {
        cb(null, true);
    }
    else {
        cb(new Error("Only images are allowed!"), false);
    }
};
var multer = require('multer');
var storage = multer.memoryStorage();
exports.LeadUpload = multer({ storage: storage, fileFilter: filter });
exports.MotionUpload = multer({ storage: storage, fileFilter: filter });
// export const LeadUpload = multer({ dest: config_to_use.leadDir});
// export const MotionUpload = multer({ dest: config_to_use.motionDir});
//# sourceMappingURL=MyMulter.js.map