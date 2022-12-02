"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunModels = void 0;
var RunModels = /** @class */ (function () {
    function RunModels() {
    }
    RunModels.prototype.runLead = function (inputFile, outputFile, img_mod) {
        var leadCode = 'E:/Research/SeaIceWebsite/SAI/src/leadCodes/getPrediction.py';
        return new Promise(function (resolve, reject) {
            var spawn = require("child_process").spawn;
            var pyprog = spawn('python', [leadCode, inputFile, outputFile, img_mod], {
                cwd: 'E:/Research/SeaIceWebsite/SAI/src/leadCodes'
            });
            console.log('started');
            pyprog.stdout.on('data', function (data) {
                resolve(data);
            });
            pyprog.stdout.on('data', function (data) {
                reject(data);
            });
            console.log('finished');
        });
    };
    return RunModels;
}());
exports.RunModels = RunModels;
//# sourceMappingURL=RunModels.js.map