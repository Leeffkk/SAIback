
export class MotionImagesModel{
    id='';
    name1='';
    name2='';
    output_name='';
    comments='';
    toRemove='true';
    submittedBy='';
    updatedBy='';
    dateSubmitted='';
    dateUpdated='';

    static fromObject(object:any):MotionImagesModel{
        const p:MotionImagesModel=new MotionImagesModel();
        p.name1=object.name1;
        p.name2=object.name2;
        p.output_name=object.output_name;
        p.comments=object.comments;
        // p.description=object.description;
        // p.url=object.url;

        // if(object.groupMembers){
        //     var tmp = object.groupMembers;
        //     tmp = tmp.substring(1, tmp.length-1);
        //     p.groupMembers = tmp.split(",")
        // }

        //TODO:: maybe need to rewrite
        // p.posts=object.posts;

        p.toRemove=object.toRemove;
        // p.applicant=object.applicant;
        // p.approvedBy=object.approvedBy
        p.submittedBy=object.submittedBy;
        p.updatedBy=object.updatedBy;
        p.dateSubmitted=object.dateSubmitted;
        p.dateUpdated=object.dateUpdated;

        return p;
    }
    toObject():any{
        return {name1:this.name1,
            name2:this.name2,
            output_name:this.output_name,
            // description:this.description,
            // url:this.url,
            // groupMembers:this.groupMembers,
            // posts:this.posts,
            toRemove:this.toRemove,
            comments:this.comments,
            // applicant:this.applicant,
            // approvedBy:this.approvedBy,
            submittedBy:this.submittedBy,
            updatedBy:this.updatedBy,
            dateSubmitted:this.dateSubmitted,
            dateUpdated:this.dateUpdated};
    }
}