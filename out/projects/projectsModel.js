"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModel = void 0;
var ProjectsModel = /** @class */ (function () {
    function ProjectsModel() {
        this.id = '';
        this.name = '';
        this.description = '';
        this.url = '';
        this.groupMembers = [];
        this.posts = [];
        this.state = '';
        this.applicant = '';
        this.approvedBy = '';
        this.dateSubmitted = '';
        this.dateUpdated = '';
    }
    ProjectsModel.fromObject = function (object) {
        var p = new ProjectsModel();
        p.name = object.name;
        p.description = object.description;
        p.url = object.url;
        if (object.groupMembers) {
            var tmp = object.groupMembers;
            tmp = tmp.substring(1, tmp.length - 1);
            p.groupMembers = tmp.split(",");
        }
        //TODO:: maybe need to rewrite
        p.posts = object.posts;
        p.state = object.state;
        p.applicant = object.applicant;
        p.approvedBy = object.approvedBy;
        p.dateSubmitted = object.dateSubmitted;
        p.dateUpdated = object.dateUpdated;
        return p;
    };
    ProjectsModel.prototype.toObject = function () {
        return { name: this.name,
            description: this.description,
            url: this.url,
            groupMembers: this.groupMembers,
            posts: this.posts,
            state: this.state,
            applicant: this.applicant,
            approvedBy: this.approvedBy,
            dateSubmitted: this.dateSubmitted,
            dateUpdated: this.dateUpdated };
    };
    return ProjectsModel;
}());
exports.ProjectsModel = ProjectsModel;
//# sourceMappingURL=projectsModel.js.map