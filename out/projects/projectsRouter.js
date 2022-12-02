"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsRouter = void 0;
var AppRouter_1 = require("../common/AppRouter");
var MyMulter_1 = require("../common/MyMulter");
var projectsController_1 = require("./projectsController");
//This is just an example second router to show how additional routers can be added
var ProjectsRouter = /** @class */ (function (_super) {
    __extends(ProjectsRouter, _super);
    function ProjectsRouter() {
        return _super.call(this) || this;
    }
    //sets up the routes within this module shows an example of a route that requires authorization, and one that does not
    ProjectsRouter.prototype.setupRoutes = function () {
        // this.expressRouter.get('/getApprovedProjects',ProjectsRouter.projController.getApprovedProjects);
        // this.expressRouter.get('/getSubmittedProjects',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getSubmittedProjects);
        // this.expressRouter.get('/getProjectsByCurUser',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getProjectsByCurUser);
        // this.expressRouter.post('/',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.addProject);
        // this.expressRouter.put('/',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.updateProject);
        // this.expressRouter.post('/deleteProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.deleteProject);
        // this.expressRouter.get('/getAllProjects',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getAllProjects);
        // this.expressRouter.post('/approveProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.approveProject);
        // this.expressRouter.post('/rejectProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.rejectProject);
        // this.expressRouter.post('/checkProjectCommits',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.checkProjectCommits);
        this.expressRouter.post('/uploadLead', MyMulter_1.LeadUpload.single('file'), ProjectsRouter.projController.uploadLead);
        this.expressRouter.post('/downloadLead', ProjectsRouter.projController.downloadLead);
        this.expressRouter.post('/isReadyLead', ProjectsRouter.projController.isReadyLead);
    };
    ProjectsRouter.projController = new projectsController_1.ProjectsController();
    return ProjectsRouter;
}(AppRouter_1.AppRouter));
exports.ProjectsRouter = ProjectsRouter;
//# sourceMappingURL=projectsRouter.js.map