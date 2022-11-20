"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotionUpload = void 0;
var config_1 = require("../config");
//Multer information 
var multer = require('multer');
exports.MotionUpload = multer({ dest: config_1.Config.motionDir });
//# sourceMappingURL=MyMulter.js.map