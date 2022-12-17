"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadUpload = void 0;
var config_1 = require("../config");
//Multer information Motion
var config_to_use = config_1.Config;
if (process.env.NODE_ENV && process.env.NODE_ENV == "prod") {
    config_to_use = config_1.ProdConfig;
}
var multer = require('multer');
exports.LeadUpload = multer({ dest: config_to_use.leadDir });
//# sourceMappingURL=MyMulter.js.map