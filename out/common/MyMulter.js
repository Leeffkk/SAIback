"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadUpload = void 0;
var config_1 = require("../config");
//Multer information Motion
var multer = require('multer');
exports.LeadUpload = multer({ dest: config_1.Config.leadDir });
//# sourceMappingURL=MyMulter.js.map