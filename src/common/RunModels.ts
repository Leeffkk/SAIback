import { Config, ProdConfig } from '../config';

var config_to_use = Config;
if (process.env.NODE_ENV && process.env.NODE_ENV=="prod"){
    config_to_use = ProdConfig;
}

export class RunModels {
    constructor(){}


    runLead(inputFile:string, outputFile:string, img_mod:string): Promise<boolean>{
        return new Promise(function(resolve, reject){
            const spawn = require("child_process").spawn;
            const pyprog = spawn(config_to_use.leadPythonDir, [config_to_use.leadCode, inputFile, outputFile, img_mod], {
                cwd: config_to_use.leadCodeDir
            })
            console.log('lead run model started:' + '\n\t' + config_to_use.leadCode + '\n\t' + inputFile + '\n\t' + outputFile + '\n\t' + img_mod);
            pyprog.stdout.on('data', function(data:any){
                console.log('child process data ' + data.toString());
                // resolve(data);
            })
            pyprog.on('close', (code:any) => {
                console.log('child process close all stdio with code: ' + code.toString());
            });
            pyprog.on('exit', (code:any) => {
                console.log('child process exit with code ' + code.toString());
            });
            pyprog.on('error', (code:any) => {
                console.log('child process error with code ' + code.toString());
            });
            
            // pyprog.stdout.on('data', (data:any) => {
            //     reject(data);
            // })
            console.log('lead run model finished')
        })
    }

    runMotion(inputFile1:string, inputFile2:string, outputFile:string, img_mod:string): Promise<boolean>{
        return new Promise(function(resolve, reject){
            const spawn = require("child_process").spawn;
            const pyprog = spawn(config_to_use.motionPythonDir, [config_to_use.motionCode, inputFile1, inputFile2, outputFile], {
                cwd: config_to_use.motionCodeDir
            })
            console.log('motion run model started:' + '\n\t' + config_to_use.motionCode + '\n\t' + inputFile1 + '\n\t' + inputFile2 + '\n\t' + outputFile);
            pyprog.stdout.on('data', function(data:any){
                console.log('child process data ' + data.toString());
                // resolve(data);
            })
            pyprog.on('close', (code:any) => {
                console.log('child process close all stdio with code: ' + code.toString());
            });
            pyprog.on('exit', (code:any) => {
                console.log('child process exit with code ' + code.toString());
            });
            pyprog.on('error', (code:any) => {
                console.log('child process error with code ' + code.toString());
            });
            
            // pyprog.stdout.on('data', (data:any) => {
            //     reject(data);
            // })
            console.log('motion run model finished')
        })
    }
}