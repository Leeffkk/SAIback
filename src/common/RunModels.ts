export class RunModels {
    constructor(){}


    runMotion(inputFile:string, outputFile:string, img_mod:string): Promise<boolean>{
        var motionCode = 'E:/Research/SeaIceWebsite/SAI/src/motionCodes/getPrediction.py';
        return new Promise(function(resolve, reject){
            const spawn = require("child_process").spawn;
            const pyprog = spawn('python', [motionCode, inputFile, outputFile, img_mod], {
                cwd: 'E:/Research/SeaIceWebsite/SAI/src/motionCodes'
            })
            console.log('started')
            pyprog.stdout.on('data', function(data:any){
                resolve(data);
            })
            pyprog.stdout.on('data', (data:any) => {
                reject(data);
            })
            console.log('finished')
        })
    }
}