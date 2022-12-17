"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunModels = void 0;
var config_1 = require("../config");
var config_to_use = config_1.Config;
if (process.env.NODE_ENV && process.env.NODE_ENV == "prod") {
    config_to_use = config_1.ProdConfig;
}
var RunModels = /** @class */ (function () {
    function RunModels() {
    }
    RunModels.prototype.runLead = function (inputFile, outputFile, img_mod) {
        return new Promise(function (resolve, reject) {
            var spawn = require("child_process").spawn;
            var pyprog = spawn('python', [config_to_use.leadCode, inputFile, outputFile, img_mod], {
                cwd: config_to_use.leadCodeDir
            });
            console.log('lead run model started');
            pyprog.stdout.on('data', function (data) {
                resolve(data);
            });
            pyprog.stdout.on('data', function (data) {
                reject(data);
            });
            console.log('lead run model finished');
        });
    };
    return RunModels;
}());
exports.RunModels = RunModels;
//# sourceMappingURL=RunModels.js.map