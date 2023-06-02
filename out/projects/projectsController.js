"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
var projectsModel_1 = require("./projectsModel");
var MongoDB_1 = require("../common/MongoDB");
var config_1 = require("../config");
// import { LeadUpload } from '../common/MyMulter';
var RunModels_1 = require("../common/RunModels");
var imagesModel_1 = require("./imagesModel");
//This is just an example of a second controller attached to the security module
var config_to_use = config_1.Config;
if (process.env.NODE_ENV && process.env.NODE_ENV == "prod") {
    config_to_use = config_1.ProdConfig;
}
var ProjectsController = /** @class */ (function () {
    function ProjectsController() {
    }
    //getApprovedProjects
    //sends a json object with all projects in the system
    ProjectsController.prototype.getApprovedProjects = function (req, res) {
        ProjectsController.db.getRecords(ProjectsController.projectsTable, { 'state': 'approved' })
            .then(function (results) {
            results.map(function (x) {
                delete x.applicant;
                delete x.approvedBy;
                delete x.dateSubmitted;
                delete x.dateUpdated;
                delete x.posts;
            });
            res.send({ fn: 'getApprovedProjects', status: 'success', data: { projects: results } });
        })
            .catch(function (reason) { return res.status(500).send(reason).end(); });
    };
    //getSubmittedProjects
    //sends a json object with all projects in the system
    ProjectsController.prototype.getSubmittedProjects = function (req, res) {
        ProjectsController.db.getRecords(ProjectsController.projectsTable, { 'applicant': req.body.authUser.email })
            .then(function (results) {
            results.map(function (x) {
                if (x.dateSubmitted) {
                    x.dateSubmitted = new Date(parseInt(x.dateSubmitted)).toUTCString();
                }
                if (x.dateUpdated) {
                    x.dateUpdated = new Date(parseInt(x.dateUpdated)).toUTCString();
                }
            });
            res.send({ fn: 'getSubmittedProjects', status: 'success', data: { projects: results } });
        })
            .catch(function (reason) { return res.status(500).send(reason).end(); });
    };
    //getProjectsByCurUser
    //sends the specific project as JSON with current user as groupmember
    ProjectsController.prototype.getProjectsByCurUser = function (req, res) {
        var user = req.body.authUser;
        ProjectsController.db.getRecords(ProjectsController.projectsTable, { 'state': 'approved', 'groupMembers': { $in: [user.email] } })
            .then(function (results) {
            results.map(function (x) {
                delete x.applicant;
                delete x.approvedBy;
                delete x.dateSubmitted;
                delete x.dateUpdated;
            });
            res.send({ fn: 'getProjectsByCurUser', status: 'success', data: results }).end();
        })
            .catch(function (reason) { return res.status(500).send(reason).end(); });
    };
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
    ProjectsController.prototype.addProject = function (req, res) {
        var proj = projectsModel_1.ProjectsModel.fromObject(req.body);
        proj.posts = [];
        proj.state = 'pending';
        proj.applicant = req.body.authUser.email;
        proj.dateSubmitted = Date.now().toString();
        proj.dateUpdated = proj.dateSubmitted;
        ProjectsController.db.addRecord(ProjectsController.projectsTable, proj.toObject())
            .then(function (result) { return res.send({ fn: 'addProject', status: 'success' }).end(); })
            .catch(function (reason) { return res.status(500).send(reason).end(); });
    };
    //updateProject
    //updates the project in the database with id :id
    ProjectsController.prototype.updateProject = function (req, res) {
        if (req.body.authUser.isAdmin !== 'True') {
            res.send({ fn: 'updateProject', status: 'failure', data: 'User is not Administrator' });
        }
        else {
            var id_1 = MongoDB_1.Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, { '_id': id_1 })
                .then(function (result) {
                if (result.state != 'approved') {
                    res.send({ fn: 'updateProject', status: 'failure', data: 'state must be "approved"' });
                }
                else {
                    var proj = projectsModel_1.ProjectsModel.fromObject(req.body);
                    var tmpObj = proj.toObject();
                    delete tmpObj.id;
                    delete tmpObj.posts;
                    delete tmpObj.state;
                    delete tmpObj.applicant;
                    delete tmpObj.approvedBy;
                    delete tmpObj.dateSubmitted;
                    tmpObj.dateUpdated = Date.now().toString();
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id_1 }, { $set: tmpObj })
                        .then(function (results) { return results ? (res.send({ fn: 'updateProject', status: 'success' })) : (res.send({ fn: 'updateProject', status: 'failure', data: 'Not found' })).end(); })
                        .catch(function (err) { return res.send({ fn: 'updateProject', status: 'failure', data: err }).end(); });
                }
            }).catch(function (err) { return res.send({ fn: 'updateProject', status: 'failure', data: err }).end(); });
        }
    };
    //deleteProject
    //deletes the project in the database with id :id
    ProjectsController.prototype.deleteProject = function (req, res) {
        if (req.body.authUser.isAdmin !== 'True') {
            res.send({ fn: 'deleteProject', status: 'failure', data: 'User is not Administrator' });
        }
        else {
            var id_2 = MongoDB_1.Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, { '_id': id_2 })
                .then(function (result) {
                if (result.state != 'approved') {
                    res.send({ fn: 'deleteProject', status: 'failure', data: 'state must be "approved"' });
                }
                else {
                    var data = req.body;
                    data.dateUpdated = Date.now().toString();
                    delete data.authUser;
                    delete data.id;
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id_2 }, { $set: { 'state': 'deleted', 'dateUpdated': Date.now().toString() } })
                        .then(function (results) { return results ? (res.send({ fn: 'deleteProject', status: 'success' })) : (res.send({ fn: 'deleteProject', status: 'failure', data: 'Not found' })).end(); })
                        .catch(function (err) { return res.send({ fn: 'deleteProject', status: 'failure', data: err }).end(); });
                }
            }).catch(function (err) { return res.send({ fn: 'deleteProject', status: 'failure', data: err }).end(); });
        }
    };
    //getAllProjects
    //checks if current user is admin, if True then returns all projects
    ProjectsController.prototype.getAllProjects = function (req, res) {
        if (req.body.authUser.isAdmin !== 'True') {
            res.send({ fn: 'getAllProjects', status: 'failure', data: 'User is not Administrator' });
        }
        else {
            ProjectsController.db.getRecords(ProjectsController.projectsTable, {})
                .then(function (results) {
                results.map(function (x) {
                    if (x.dateSubmitted) {
                        x.dateSubmitted = new Date(parseInt(x.dateSubmitted)).toUTCString();
                    }
                    if (x.dateUpdated) {
                        x.dateUpdated = new Date(parseInt(x.dateUpdated)).toUTCString();
                    }
                });
                res.send({ fn: 'getAllProjects', status: 'success', data: { projects: results } });
            })
                .catch(function (reason) { return res.status(500).send(reason).end(); });
        }
    };
    //approveProject
    //checks admin, if Ture then approves the project in the database with id :id
    ProjectsController.prototype.approveProject = function (req, res) {
        if (req.body.authUser.isAdmin !== 'True') {
            res.send({ fn: 'approveProject', status: 'failure', data: 'User is not Administrator' });
        }
        else {
            var id_3 = MongoDB_1.Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, { '_id': id_3 })
                .then(function (result) {
                if (result.state != 'pending') {
                    res.send({ fn: 'approveProject', status: 'failure', data: 'state must be "pending"' });
                }
                else {
                    var data = req.body;
                    data.dateUpdated = Date.now().toString();
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id_3 }, { $set: { 'state': 'approved', 'dateUpdated': Date.now().toString(), 'approvedBy': req.body.authUser.email } })
                        .then(function (results) { return results ? (res.send({ fn: 'approveProject', status: 'success' })) : (res.send({ fn: 'approveProject', status: 'failure', data: 'Not found' })).end(); })
                        .catch(function (err) { return res.send({ fn: 'approveProject', status: 'failure1', data: err }).end(); });
                }
            }).catch(function (err) { return res.send({ fn: 'approveProject', status: 'failure2', data: err }).end(); });
        }
    };
    //rejectProject
    //checks admin, if Ture then rejects the project in the database with id :id
    ProjectsController.prototype.rejectProject = function (req, res) {
        if (req.body.authUser.isAdmin !== 'True') {
            res.send({ fn: 'rejectProject', status: 'failure', data: 'User is not Administrator' });
        }
        else {
            var id_4 = MongoDB_1.Database.stringToId(req.body.id);
            ProjectsController.db.getOneRecord(ProjectsController.projectsTable, { '_id': id_4 })
                .then(function (result) {
                if (result.state != 'pending') {
                    res.send({ fn: 'rejectProject', status: 'failure', data: 'state must be "pending"' });
                }
                else {
                    var data = req.body;
                    data.dateUpdated = Date.now().toString();
                    ProjectsController.db.updateRecord(ProjectsController.projectsTable, { _id: id_4 }, { $set: { 'state': 'rejected', 'dateUpdated': Date.now().toString(), 'approvedBy': req.body.authUser.email } })
                        .then(function (results) { return results ? (res.send({ fn: 'rejectProject', status: 'success' })) : (res.send({ fn: 'rejectProject', status: 'failure', data: 'Not found' })).end(); })
                        .catch(function (err) { return res.send({ fn: 'rejectProject', status: 'failure', data: err }).end(); });
                }
            }).catch(function (err) { return res.send({ fn: 'rejectProject', status: 'failure', data: err }).end(); });
        }
    };
    //checkProjectCommits
    //takes a github url, calls github api to get commit histroy
    ProjectsController.prototype.checkProjectCommits = function (req, res) {
        if (req.body.url == null) {
            res.send({ fn: 'checkProjectCommits', status: 'failure', data: 'url can not be null' });
        }
        else {
            //  Processing url start
            //  sample input:   https://github.com/Leeffkk/Group5-Project2.5BackEnd
            //  target output:  https://api.github.com/repos/Leeffkk/Group5-Project2.5BackEnd/commits
            var url = req.body.url;
            if (url.charAt(url.length - 1) == '/') {
                url = url.substring(0, url.length - 1);
            }
            url = url + '/commits';
            var re = /https:\/\/github.com/gi;
            url = url.replace(re, '/repos');
            //  Processing url finish
            var github = require('octonode');
            var client = github.client();
            client.get(url, {}, function (err, status, body, headers) {
                if (!err && status == 200) {
                    var commits = body.map(function (commit) { return commit.commit; });
                    res.send({ fn: 'checkProjectCommits', status: 'success', data: commits });
                }
                else {
                    res.send({ fn: 'checkProjectCommits', status: 'failure', data: err });
                }
            });
        }
    };
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
    ProjectsController.prototype.uploadLead = function (req, res) {
        try {
            var allowed_model_params = config_to_use.allowed_lead_params;
            var img_mod = req.body.model_param;
            if (!(allowed_model_params.includes(img_mod))) {
                throw new Error('invalid model_param: ' + img_mod);
            }
            var file = req.file;
            console.log(file);
            var fs = require('fs');
            var old_file_name = file.filename;
            var new_file_name = Date.now() + file.originalname;
            // fs.renameSync(file.destination + old_file_name, file.destination + new_file_name);
            var sharp = require('sharp');
            sharp(file.buffer).resize(100).toFile(config_to_use.leadDir + new_file_name).then();
            console.log(fs.existsSync(config_to_use.leadDir + new_file_name));
            var path = require('path');
            var abs_destination = path.resolve(config_to_use.leadDir) + '\\';
            var inputFile = abs_destination + new_file_name;
            var outputFile = abs_destination + 'output_' + new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png';
            inputFile = inputFile.replace('\\', '/');
            outputFile = outputFile.replace('\\', '/');
            console.log('inputFile: ', inputFile);
            console.log("outputFile: ", outputFile);
            console.log("img_mod: ", img_mod);
            while (!fs.existsSync(inputFile)) {
                setTimeout(function () { }, 1000);
            }
            // upload to database
            // const image: ImagesModel = new ImagesModel();
            // image.name = new_file_name;
            // image.output_name = 'output_'+ new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png';
            // image.dateSubmitted=Date.now().toString();
            // image.dateUpdated=image.dateSubmitted;
            // if (req.body.toRemove && req.body.model_param =='false') {
            //     image.toRemove = 'false';
            // }
            // ProjectsController.db.addRecord(ProjectsController.imagesTable, image.toObject())
            //     .then((result: boolean) => res.send({ fn: 'addImage', status: 'success' }).end())
            //     .catch((reason) => res.status(500).send(reason).end());
            // // upload to database
            ProjectsController.runModels.runLead(inputFile, outputFile, img_mod)
                .then(function (result) { }).catch(function (reason) { return res.status(500).send(reason).end(); });
            console.log('then!!!!!!!!!!!!!!');
            res.send({ fn: 'uploadLead', status: 'success', data: 'output_' + new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png' });
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'uploadLead', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.updateComment = function (req, res) {
        var image = imagesModel_1.ImagesModel.fromObject(req.body);
        ProjectsController.db.getOneRecord(ProjectsController.imagesTable, { 'output_name': req.body.output_name })
            .then(function (result) {
            var image = imagesModel_1.ImagesModel.fromObject(req.body);
            var tmpObj = image.toObject();
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
                .then(function (results) { return results ? (res.send({ fn: 'updateComment', status: 'success' })) : (res.send({ fn: 'updateComment', status: 'failure', data: 'Not found' })).end(); })
                .catch(function (err) { return res.send({ fn: 'updateComment', status: 'failure', data: err }).end(); });
        }).catch(function (err) { return res.send({ fn: 'updateComment', status: 'failure', data: err }).end(); });
    };
    //downloadLead
    //download Lead result processed by lead model
    ProjectsController.prototype.downloadLead = function (req, res) {
        try {
            if (req.body.name == null) {
                res.send({ fn: 'downloadLead', status: 'failure', data: 'name can not be null' });
            }
            var name = req.body.name;
            var path = require('path');
            var filePath = path.resolve(config_to_use.leadDir + name);
            console.log("downloadLead: ", filePath);
            var fs = require('fs');
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            }
            else {
                res.send({ fn: 'downloadLead', status: 'failure', data: 'file not avaiable' });
            }
            // res.send({ fn: 'downloadLead', status: 'success', data:''});
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'downloadLead', status: 'failure', data: err });
        }
    };
    //isReadyLead
    //checks if the result processed by lead model is ready to be downloaded
    ProjectsController.prototype.isReadyLead = function (req, res) {
        try {
            if (req.body.name == null) {
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
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'isReadyLead', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.uploadLeadAnnotation = function (req, res) {
        try {
            if (req.body.name == null) {
                res.send({ fn: 'uploadLeadAnnotation', status: 'failure', data: 'name can not be null' });
            }
            var name_1 = req.body.name;
            var positions = req.body.positions;
            console.log("uploadLeadAnnotation_positions: ", positions);
            var converted_positions = JSON.stringify(positions);
            console.log("uploadLeadAnnotation_Converted: ", converted_positions);
            var path = require('path');
            var filePath = path.resolve(config_to_use.leadDir + name_1);
            console.log("uploadLeadAnnotation: ", filePath);
            var fs = require('fs');
            fs.writeFile(filePath, converted_positions, function (err) {
                console.error("Crashed when writing file: ", err);
            });
            res.send({ fn: 'uploadLeadAnnotation', status: 'success', data: 'success!' });
            // res.send({ fn: 'uploadLeadAnnotation', status: 'success', data:''});
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'uploadLeadAnnotation', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.uploadMotion1 = function (req, res) {
        try {
            var file = req.file;
            console.log(file);
            var fs = require('fs');
            var old_file_name = file.filename;
            var new_file_name = Date.now() + file.originalname;
            fs.renameSync(file.destination + old_file_name, file.destination + new_file_name);
            console.log(fs.existsSync(file.destination + new_file_name));
            var path = require('path');
            var abs_destination = path.resolve(file.destination) + '\\';
            var inputFile1 = abs_destination + new_file_name;
            inputFile1 = inputFile1.replace('\\', '/');
            console.log('inputFile1: ', inputFile1);
            while (!fs.existsSync(inputFile1)) {
                setTimeout(function () { }, 1000);
            }
            res.send({ fn: 'uploadMotion1', status: 'success', data: inputFile1 });
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'uploadMotion1', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.uploadMotion2 = function (req, res) {
        try {
            var file = req.file;
            console.log(file);
            var fs = require('fs');
            var old_file_name = file.filename;
            var new_file_name = Date.now() + file.originalname;
            fs.renameSync(file.destination + old_file_name, file.destination + new_file_name);
            console.log(fs.existsSync(file.destination + new_file_name));
            var path = require('path');
            var abs_destination = path.resolve(file.destination) + '\\';
            var inputFile1 = req.body.inputFile1;
            var inputFile2 = abs_destination + new_file_name;
            var outputFile = abs_destination + 'output_' + new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png';
            inputFile1 = inputFile1.replace('\\', '/');
            inputFile2 = inputFile2.replace('\\', '/');
            outputFile = outputFile.replace('\\', '/');
            console.log('inputFile1: ', inputFile1);
            console.log('inputFile2: ', inputFile2);
            console.log("outputFile: ", outputFile);
            while (!fs.existsSync(inputFile2)) {
                setTimeout(function () { }, 1000);
            }
            ProjectsController.runModels.runMotion(inputFile1, inputFile2, outputFile)
                .then(function (result) { }).catch(function (reason) { return res.status(500).send(reason).end(); });
            console.log('then!!!!!!!!!!!!!!');
            res.send({ fn: 'uploadMotion2', status: 'success', data: 'output_' + new_file_name.substring(0, new_file_name.lastIndexOf('.')) + '.png' });
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'uploadMotion2', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.downloadMotion = function (req, res) {
        try {
            if (req.body.name == null) {
                res.send({ fn: 'downloadMotion', status: 'failure', data: 'name can not be null' });
            }
            var name = req.body.name;
            var path = require('path');
            var filePath = path.resolve(config_to_use.motionDir + name);
            console.log("downloadMotion: ", filePath);
            var fs = require('fs');
            if (fs.existsSync(filePath)) {
                res.sendFile(filePath);
            }
            else {
                res.send({ fn: 'downloadMotion', status: 'failure', data: 'file not avaiable' });
            }
            // res.send({ fn: 'downloadMotion', status: 'success', data:''});
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'downloadMotion', status: 'failure', data: err });
        }
    };
    ProjectsController.prototype.isReadyMotion = function (req, res) {
        try {
            if (req.body.name == null) {
                res.send({ fn: 'isReadyMotion', status: 'failure', data: 'name can not be null' });
            }
            var name = req.body.name;
            var path = require('path');
            var filePath = path.resolve(config_to_use.motionDir + name);
            console.log("isReadyMotion: ", filePath);
            var fs = require('fs');
            var isReady = fs.existsSync(filePath);
            console.log("Is file ready? :", isReady);
            res.send({ fn: 'isReadyMotion', status: 'success', data: isReady });
            // res.send({ fn: 'isReadyMotion', status: 'success', data:''});
        }
        catch (err) {
            console.error(err);
            res.send({ fn: 'isReadyLead', status: 'failure', data: err });
        }
    };
    ProjectsController.db = new MongoDB_1.Database(config_to_use.url, "images");
    ProjectsController.imagesTable = 'images';
    ProjectsController.projectsTable = 'projects';
    ProjectsController.runModels = new RunModels_1.RunModels();
    return ProjectsController;
}());
exports.ProjectsController = ProjectsController;
//# sourceMappingURL=projectsController.js.map