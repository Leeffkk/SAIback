"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImagesModel = void 0;
var ImagesModel = /** @class */ (function () {
    function ImagesModel() {
        this.id = '';
        this.name = '';
        this.output_name = '';
        this.comments = '';
        this.toRemove = 'true';
        this.submittedBy = '';
        this.updatedBy = '';
        this.dateSubmitted = '';
        this.dateUpdated = '';
    }
    ImagesModel.fromObject = function (object) {
        var p = new ImagesModel();
        p.name = object.name;
        p.output_name = object.output_name;
        p.comments = object.comments;
        // p.description=object.description;
        // p.url=object.url;
        // if(object.groupMembers){
        //     var tmp = object.groupMembers;
        //     tmp = tmp.substring(1, tmp.length-1);
        //     p.groupMembers = tmp.split(",")
        // }
        //TODO:: maybe need to rewrite
        // p.posts=object.posts;
        p.toRemove = object.toRemove;
        // p.applicant=object.applicant;
        // p.approvedBy=object.approvedBy
        p.submittedBy = object.submittedBy;
        p.updatedBy = object.updatedBy;
        p.dateSubmitted = object.dateSubmitted;
        p.dateUpdated = object.dateUpdated;
        return p;
    };
    ImagesModel.prototype.toObject = function () {
        return { name: this.name,
            output_name: this.output_name,
            // description:this.description,
            // url:this.url,
            // groupMembers:this.groupMembers,
            // posts:this.posts,
            toRemove: this.toRemove,
            comments: this.comments,
            // applicant:this.applicant,
            // approvedBy:this.approvedBy,
            submittedBy: this.submittedBy,
            updatedBy: this.updatedBy,
            dateSubmitted: this.dateSubmitted,
            dateUpdated: this.dateUpdated };
    };
    return ImagesModel;
}());
exports.ImagesModel = ImagesModel;
//# sourceMappingURL=imagesModel.js.map