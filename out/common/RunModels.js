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
            var pyprog = spawn(config_to_use.leadPythonDir, [config_to_use.leadCode, inputFile, outputFile, img_mod], {
                cwd: config_to_use.leadCodeDir
            });
            console.log('lead run model started:' + '\n\t' + config_to_use.leadCode + '\n\t' + inputFile + '\n\t' + outputFile + '\n\t' + img_mod);
            pyprog.stdout.on('data', function (data) {
                console.log('child process data ' + data.toString());
                // resolve(data);
            });
            pyprog.on('close', function (code) {
                console.log('child process close all stdio with code: ' + code.toString());
            });
            pyprog.on('exit', function (code) {
                console.log('child process exit with code ' + code.toString());
            });
            pyprog.on('error', function (code) {
                console.log('child process error with code ' + code.toString());
            });
            // pyprog.stdout.on('data', (data:any) => {
            //     reject(data);
            // })
            console.log('lead run model finished');
        });
    };
    RunModels.prototype.runMotion = function (inputFile1, inputFile2, outputFile) {
        return new Promise(function (resolve, reject) {
            var spawn = require("child_process").spawn;
            var pyprog = spawn(config_to_use.motionPythonDir, [config_to_use.motionCode, inputFile1, inputFile2, outputFile], {
                cwd: config_to_use.motionCodeDir
            });
            console.log('motion run model started:' + '\n\t' + config_to_use.motionCode + '\n\t' + inputFile1 + '\n\t' + inputFile2 + '\n\t' + outputFile);
            pyprog.stdout.on('data', function (data) {
                console.log('child process data ' + data.toString());
                // resolve(data);
            });
            pyprog.on('close', function (code) {
                console.log('child process close all stdio with code: ' + code.toString());
            });
            pyprog.on('exit', function (code) {
                console.log('child process exit with code ' + code.toString());
            });
            pyprog.on('error', function (code) {
                console.log('child process error with code ' + code.toString());
            });
            // pyprog.stdout.on('data', (data:any) => {
            //     reject(data);
            // })
            console.log('motion run model finished');
        });
    };
    return RunModels;
}());
exports.RunModels = RunModels;
//# sourceMappingURL=RunModels.js.map