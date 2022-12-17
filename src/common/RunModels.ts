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
            const pyprog = spawn('python', [config_to_use.leadCode, inputFile, outputFile, img_mod], {
                cwd: config_to_use.leadCodeDir
            })
            console.log('lead run model started')
            pyprog.stdout.on('data', function(data:any){
                resolve(data);
            })
            pyprog.stdout.on('data', (data:any) => {
                reject(data);
            })
            console.log('lead run model finished')
        })
    }
}