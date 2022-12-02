export class RunModels {
    constructor(){}


    runLead(inputFile:string, outputFile:string, img_mod:string): Promise<boolean>{
        var leadCode = 'E:/Research/SeaIceWebsite/SAI/src/leadCodes/getPrediction.py';
        return new Promise(function(resolve, reject){
            const spawn = require("child_process").spawn;
            const pyprog = spawn('python', [leadCode, inputFile, outputFile, img_mod], {
                cwd: 'E:/Research/SeaIceWebsite/SAI/src/leadCodes'
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