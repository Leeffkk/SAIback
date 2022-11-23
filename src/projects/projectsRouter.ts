import { AppRouter } from "../common/AppRouter";
import { MotionUpload } from "../common/MyMulter";
import { SecurityMiddleware } from "../security/securityMiddleware";
import { ProjectsController } from "./projectsController";

//This is just an example second router to show how additional routers can be added
export class ProjectsRouter extends AppRouter{
    static projController: ProjectsController=new ProjectsController();
    constructor(){super();}

    //sets up the routes within this module shows an example of a route that requires authorization, and one that does not
    setupRoutes(): void {      
        this.expressRouter.get('/getApprovedProjects',ProjectsRouter.projController.getApprovedProjects);
        this.expressRouter.get('/getSubmittedProjects',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getSubmittedProjects);
        this.expressRouter.get('/getProjectsByCurUser',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getProjectsByCurUser);
        // this.expressRouter.get('/getProjectsById',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getProjectsById);
        this.expressRouter.post('/',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.addProject);
        this.expressRouter.put('/',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.updateProject);
        this.expressRouter.post('/deleteProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.deleteProject);
        this.expressRouter.get('/getAllProjects',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.getAllProjects);
        this.expressRouter.post('/approveProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.approveProject);
        this.expressRouter.post('/rejectProject',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.rejectProject);
        this.expressRouter.post('/checkProjectCommits',[SecurityMiddleware.RequireAuth],ProjectsRouter.projController.checkProjectCommits);
        this.expressRouter.post('/uploadMotion', MotionUpload.single('file'), ProjectsRouter.projController.uploadMotion);
        this.expressRouter.post('/downloadMotion', ProjectsRouter.projController.downloadMotion);
    }
}