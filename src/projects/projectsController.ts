import express, { RequestHandler } from 'express';
import { ProjectsModel } from './projectsModel';
import { Database } from '../common/MongoDB';
import { Config, ProdConfig } from '../config';
// import { LeadUpload } from '../common/MyMulter';
import { RunModels } from '../common/RunModels';
import { ImagesModel } from './imagesModel';

//This is just an example of a second controller attached to the security module

var config_to_use = Config;
if (process.env.NODE_ENV && process.env.NODE_ENV=="prod"){
    config_to_use = ProdConfig;
}

export class ProjectsController {
    static db: Database = new Database(config_to_use.url, "images");
    static imagesTable = 'images';
    static projectsTable = 'projects';
    static runModels: RunModels = new RunModels();
    
    
    //getApprovedProjects
    //sends a json object with all projects in the system
    getApprovedProjects(req: express.Request, res: express.Response) {
        ProjectsController.db.getRecords(ProjectsController.projectsTable, {'state':'approved'})
        .then(results => {
            results.map((x: any) => 
                {delete x.applicant;
                delete x.approvedBy;
                delete x.dateSubmitted;
                delete x.dateUpdated;
                delete x.posts;});
            res.send({ fn: 'getApprovedProjects', status: 'success', data: { projects: results } });
        })
        .catch((reason) => res.status(500).send(reason).end());
    }
    //getSubmittedProjects
    //sends a json object with all projects in the system
    getSubmittedProjects(req: express.Request, res: express.Response) {
        ProjectsController.db.getRecords(ProjectsController.projectsTable, {'applicant':req.body.authUser.email})
        .then(results => {
            results.map((x: any) => {
                if(x.dateSubmitted){
                    x.dateSubmitted = new Date(parseInt(x.dateSubmitted)).toUTCString();
                }
                if(x.dateUpdated){
                    x.dateUpdated = new Date(parseInt(x.dateUpdated)).toUTCString();
                }
            });
            res.send({ fn: 'getSubmittedProjects', status: 'success', data: { projects: results } });
        })
        .catch((reason) => res.status(500).send(reason).end());
    }
    //getProjectsByCurUser
    //sends the specific project as JSON with current user as groupmember
    getProjectsByCurUser(req: express.Request, res: express.Response) {
        const user = req.body.authUser;
        ProjectsController.db.getRecords(ProjectsController.projectsTable, {'state':'approved','groupMembers':{$in:[user.email]}})
            .then((results) => {
                results.map((x: any) => 
                {delete x.applicant;
                delete x.approvedBy;
                delete x.dateSubmitted;
                delete x.dateUpdated;});
                res.send({ fn: 'getProjectsByCurUser', status: 'success', data: results }).end()})
            .catch((reason) => res.status(500).send(reason).end());
    }
    //getProjectsById
    //sends the specific project as JSON with id=:id
    // getProjectsById(req: express.Request, res: express.Response) {
    //     const id = Database.stringToId(req.params.id);
    //     ProjectsController.db.getRecords(ProjectsController.projectsTable, {_id: id})
    //         .then((results) => res.send({ fn: 'getProjectsByCurUser', status: 'success', data: results }).end())
    //         .catch((reason) => res.status(500).send(reason).end());
    // }
    //addProject
    //adds the project to the database, set state to pending
    addProject(req: express.Request, res: express.Response) {
        const proj: ProjectsModel = ProjectsModel.fromObject(req.body);
        proj.posts=[];
        proj.state='pending';
        proj.applicant=req.body.authUser.email;
        proj.dateSubmitted=Date.now().toString();
        proj.dateUpdated=proj.dateSubmitted;
        ProjectsController.db.addRecord(ProjectsController.projectsTable, proj.toObject())
            .then((result: boolean) => res.send({ fn: 'addProject', status: 'success' }).end())
            .catch((reason) => res.status(500).send(reason).end());
    }

    //updateProject
    //updates the project in the database with id :id
    updateProject(req: express.Request, res: express.Response) {
        if (req.body.authUser.isAdmin !== 'True'){
            res.send({ fn: 'updateProject', status: 'failure', data: 'User is not Administrator' });
        }
        else{
            const id = Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, {'_id':id})
                .then((result) => {
                    if(result.state != 'approved'){
                        res.send({ fn: 'updateProject', status: 'failure', data: 'state must be "approved"' });
                    }
                    else{
                        const proj: ProjectsModel = ProjectsModel.fromObject(req.body);
                        const tmpObj = proj.toObject();
                        delete tmpObj.id;
                        delete tmpObj.posts;
                        delete tmpObj.state;
                        delete tmpObj.applicant;
                        delete tmpObj.approvedBy;
                        delete tmpObj.dateSubmitted;
                        tmpObj.dateUpdated=Date.now().toString();
                        ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id }, { $set: tmpObj })
                            .then((results) => results ? (res.send({ fn: 'updateProject', status: 'success' })) : (res.send({ fn: 'updateProject', status: 'failure', data: 'Not found' })).end())
                            .catch(err => res.send({ fn: 'updateProject', status: 'failure', data: err }).end());
                    }
                }).catch(err => res.send({ fn: 'updateProject', status: 'failure', data: err }).end());
        }
    }
    //deleteProject
    //deletes the project in the database with id :id
    deleteProject(req: express.Request, res: express.Response) {
        if (req.body.authUser.isAdmin !== 'True'){
            res.send({ fn: 'deleteProject', status: 'failure', data: 'User is not Administrator' });
        }
        else{
            const id = Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, {'_id':id})
            .then((result) => {
                if(result.state != 'approved'){
                    res.send({ fn: 'deleteProject', status: 'failure', data: 'state must be "approved"' });
                }
                else{
                    const data = req.body;
                    data.dateUpdated=Date.now().toString();
                    delete data.authUser;
                    delete data.id;
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id }, { $set:{'state':'deleted','dateUpdated':Date.now().toString()}})
                    .then((results) => results ? (res.send({ fn: 'deleteProject', status: 'success' })) : (res.send({ fn: 'deleteProject', status: 'failure', data: 'Not found' })).end())
                    .catch(err => res.send({ fn: 'deleteProject', status: 'failure', data: err }).end());
                }
            }).catch(err => res.send({ fn: 'deleteProject', status: 'failure', data: err }).end());
        }
    }
    //getAllProjects
    //checks if current user is admin, if True then returns all projects
    getAllProjects(req: express.Request, res: express.Response) {
        if (req.body.authUser.isAdmin !== 'True'){
            res.send({ fn: 'getAllProjects', status: 'failure', data: 'User is not Administrator' });
        }
        else{
            ProjectsController.db.getRecords(ProjectsController.projectsTable, {})
            .then(results => {
                results.map((x: any) => {
                    if(x.dateSubmitted){
                        x.dateSubmitted = new Date(parseInt(x.dateSubmitted)).toUTCString();
                    }
                    if(x.dateUpdated){
                        x.dateUpdated = new Date(parseInt(x.dateUpdated)).toUTCString();
                    }
                });
                res.send({ fn: 'getAllProjects', status: 'success', data: { projects: results } });
            })
            .catch((reason) => res.status(500).send(reason).end());
        }
    }
    //approveProject
    //checks admin, if Ture then approves the project in the database with id :id
    approveProject(req: express.Request, res: express.Response) {
        if (req.body.authUser.isAdmin !== 'True'){
            res.send({ fn: 'approveProject', status: 'failure', data: 'User is not Administrator' });
        }
        else{
            const id = Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, {'_id':id})
            .then((result) => {
                if(result.state != 'pending'){
                    res.send({ fn: 'approveProject', status: 'failure', data: 'state must be "pending"' });
                }
                else{
                    const data = req.body;
                    data.dateUpdated=Date.now().toString();
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id }, { $set:{'state':'approved','dateUpdated':Date.now().toString(),'approvedBy':req.body.authUser.email}})
                    .then((results) => results ? (res.send({ fn: 'approveProject', status: 'success' })) : (res.send({ fn: 'approveProject', status: 'failure', data: 'Not found' })).end())
                    .catch(err => res.send({ fn: 'approveProject', status: 'failure1', data: err }).end());
                }
            }).catch(err => res.send({ fn: 'approveProject', status: 'failure2', data: err }).end());
        }
    }
    //rejectProject
    //checks admin, if Ture then rejects the project in the database with id :id
    rejectProject(req: express.Request, res: express.Response) {
        if (req.body.authUser.isAdmin !== 'True'){
            res.send({ fn: 'rejectProject', status: 'failure', data: 'User is not Administrator' });
        }
        else{
            const id = Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, {'_id':id})
            .then((result) => {
                if(result.state != 'pending'){
                    res.send({ fn: 'rejectProject', status: 'failure', data: 'state must be "pending"' });
                }
                else{
                    const data = req.body;
                    data.dateUpdated=Date.now().toString();
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id }, { $set:{'state':'rejected','dateUpdated':Date.now().toString(),'approvedBy':req.body.authUser.email}})
                    .then((results) => results ? (res.send({ fn: 'rejectProject', status: 'success' })) : (res.send({ fn: 'rejectProject', status: 'failure', data: 'Not found' })).end())
                    .catch(err => res.send({ fn: 'rejectProject', status: 'failure', data: err }).end());
                }
            }).catch(err => res.send({ fn: 'rejectProject', status: 'failure', data: err }).end());
        }
    }
    //checkProjectCommits
    //takes a github url, calls github api to get commit histroy
    checkProjectCommits(req: express.Request, res: express.Response) {
        if (req.body.url == null){
            res.send({ fn: 'checkProjectCommits', status: 'failure', data: 'url can not be null' });
        }
        else{
            
            //  Processing url start
            //  sample input:   https://github.com/Leeffkk/Group5-Project2.5BackEnd
            //  target output:  https://api.github.com/repos/Leeffkk/Group5-Project2.5BackEnd/commits
            var url = req.body.url;
            if(url.charAt(url.length-1) == '/'){
                url = url.substring(0, url.length-1);
            }
            url = url + '/commits';
            var re = /https:\/\/github.com/gi;
            url = url.replace(re, '/repos');
            //  Processing url finish

            var github = require('octonode');
            var client = github.client();
            client.get(url, {}, function (err:any, status:any, body:any, headers:any) {
                if(!err && status == 200){
                    var commits = body.map((commit:any) => commit.commit);
                    res.send({ fn: 'checkProjectCommits', status: 'success', data: commits });
                }
                else{
                    res.send({ fn: 'checkProjectCommits', status: 'failure', data: err });
                }
            });

        }
    }

    // addImage(req: express.Request, res: express.Response) {
    //     const image: ImagesModel = ImagesModel.fromObject(req.body);

    //     // image.submittedBy=req.body.authUser.email;
    //     // image.submittedBy='';
    //     // image.updatedBy=req.body.authUser.email;
    //     // image.updatedBy='';
    //     image.dateSubmitted=Date.now().toString();
    //     image.dateUpdated=image.dateSubmitted;
    //     ProjectsController.db.addRecord(ProjectsController.imagesTable, image.toObject())
    //         .then((result: boolean) => res.send({ fn: 'addImage', status: 'success' }).end())
    //         .catch((reason) => res.status(500).send(reason).end());
    // }

    //uploadLead
    //uploads image for the lead model to process
    uploadLead(req: express.Request, res: express.Response) {
        try{
            var allowed_model_params = config_to_use.allowed_lead_params;

            var img_mod = req.body.model_param;

            if (! (allowed_model_params.includes(img_mod))){
                throw new Error('invalid model_param: ' + img_mod);
            }

            const file = (req as any).file;

            console.log(file);
    
            var fs = require('fs');
    
            var old_file_name = file.filename;

            var new_file_name = Date.now() + file.originalname;
    
            fs.renameSync(file.destination + old_file_name, file.destination + new_file_name);

            console.log(fs.existsSync(file.destination + new_file_name));

            var path = require('path');
            var abs_destination = path.resolve(file.destination)+'\\';

            var inputFile = abs_destination + new_file_name;
            var outputFile = abs_destination + 'output_'+ new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png';
            
            inputFile = inputFile.replace('\\', '/');
            outputFile = outputFile.replace('\\', '/');

            console.log('inputFile: ', inputFile);
            console.log("outputFile: ", outputFile);
            console.log("img_mod: ", img_mod);

            while(!fs.existsSync(inputFile)){
                setTimeout(function(){}, 1000);
            }
            

            // upload to database
            const image: ImagesModel = new ImagesModel();
            image.name = new_file_name;
            image.output_name = 'output_'+ new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png';
            image.dateSubmitted=Date.now().toString();
            image.dateUpdated=image.dateSubmitted;
            if (req.body.toRemove && req.body.model_param =='false') {
                image.toRemove = 'false';
            }
            ProjectsController.db.addRecord(ProjectsController.imagesTable, image.toObject())
                .then((result: boolean) => res.send({ fn: 'addImage', status: 'success' }).end())
                .catch((reason) => res.status(500).send(reason).end());
            // upload to database

            
            ProjectsController.runModels.runLead(inputFile, outputFile, img_mod)
                .then(result => {}).catch((reason) => res.status(500).send(reason).end());
            console.log('then!!!!!!!!!!!!!!');

            res.send({ fn: 'uploadLead', status: 'success', data: 'output_'+ new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png'});

        } catch (err) {
            console.error(err);
            res.send({ fn: 'uploadLead', status: 'failure', data: err });
        }
        
    }


    updateComment(req: express.Request, res: express.Response) {
        const image: ImagesModel = ImagesModel.fromObject(req.body);
        
        
        ProjectsController.db.getOneRecord(ProjectsController.imagesTable, {'output_name':req.body.output_name})
            .then((result) => {

                const proj: ProjectsModel = ProjectsModel.fromObject(req.body);
                const tmpObj = proj.toObject();
                delete tmpObj.id;
                delete tmpObj.name;
                delete tmpObj.output_name;
                delete tmpObj.toRemove;
                delete tmpObj.submittedBy;
                delete tmpObj.updatedBy;
                delete tmpObj.dateSubmitted;
                delete tmpObj.dateUpdated;
                // tmpObj.dateUpdated=Date.now().toString();
                
                ProjectsController.db.updateRecord(ProjectsController.imagesTable, { 'output_name': req.body.output_name }, { $set: tmpObj })
                    .then((results) => results ? (res.send({ fn: 'updateComment', status: 'success' })) : (res.send({ fn: 'updateComment', status: 'failure', data: 'Not found' })).end())
                    .catch(err => res.send({ fn: 'updateComment', status: 'failure', data: err }).end());
                
            }).catch(err => res.send({ fn: 'updateComment', status: 'failure', data: err }).end());

    
    }

        //downloadLead
    //download Lead result processed by lead model
    downloadLead(req: express.Request, res: express.Response) {
        try{
            if (req.body.name == null){
                res.send({ fn: 'downloadLead', status: 'failure', data: 'name can not be null' });
            }
            var name = req.body.name;
            var path = require('path');
            var filePath = path.resolve(config_to_use.leadDir + name);

            console.log("downloadLead: ", filePath);

            var fs = require('fs');
            if (fs.existsSync(filePath)){
                res.sendFile(filePath);
            }
            else{
                res.send({ fn: 'downloadLead', status: 'failure', data: 'file not avaiable' });
            }

            // res.send({ fn: 'downloadLead', status: 'success', data:''});

        } catch (err) {
            console.error(err);
            res.send({ fn: 'downloadLead', status: 'failure', data: err });
        }
        
    }


            //isReadyLead
    //checks if the result processed by lead model is ready to be downloaded
    isReadyLead(req: express.Request, res: express.Response) {
        try{
            if (req.body.name == null){
                res.send({ fn: 'isReadyLead', status: 'failure', data: 'name can not be null' });
            }
            var name = req.body.name;
            var path = require('path');
            var filePath = path.resolve(config_to_use.leadDir + name);

            console.log("isReadyLead: ", filePath);

            var fs = require('fs');

            
            var isReady = fs.existsSync(filePath);

            console.log("Is file ready? :", isReady);

            res.send({ fn: 'isReadyLead', status: 'success', data: isReady });


            // res.send({ fn: 'isReadyLead', status: 'success', data:''});

        } catch (err) {
            console.error(err);
            res.send({ fn: 'isReadyLead', status: 'failure', data: err });
        }
        
    }


    //getSemesters
    //returns all valid unique semesters in the database
    // getSemesters(req: express.Request, res: express.Response) {
    //     ProjectsController.db.getRecords(ProjectsController.projectsTable)
    //         .then(results => {
    //             //extracts just the semester
    //             let semesters = results.map((x: any) => x.semester);
    //             //removes duplciates
    //             semesters = semesters.filter((value: string, index: number, array: any[]) =>
    //                 !array.filter((v, i) => value === v && i < index).length);
    //             res.send({ fn: 'getSemesters', status: 'success', data: { semesters: semesters } })
    //         })
    //         .catch((reason) => res.status(500).send(reason).end());
    // }
    //getProjectNumbers
    //returns all valid unique projectNumbers for a given semesters in the database
    // getProjectNumbers(req: express.Request, res: express.Response) {
    //     const semester = req.params.semester;
    //     ProjectsController.db.getRecords(ProjectsController.projectsTable,{semester:semester})
    //         .then(results => {
    //             //extracts just the projectNumber
    //             let projects = results.map((x: any) => x.projectNumber);
    //             //removes duplciates
    //             projects = projects.filter((value: number, index: number, array: any[]) =>
    //                 !array.filter((v, i) => value === v && i < index).length);
    //             res.send({ fn: 'getProjectNumbers', status: 'success', data: { projectNumbers:projects.sort()} });
    //         })
    //         .catch((reason) => res.status(500).send(reason).end());
    // }

}