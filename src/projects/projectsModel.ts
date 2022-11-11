
export class ProjectsModel{
    id='';
    name='';
    description='';
    url='';
    groupMembers:string[]=[];
    posts:string[]=[];

    state='';
    applicant='';
    approvedBy='';
    dateSubmitted='';
    dateUpdated='';

    static fromObject(object:any):ProjectsModel{
        const p:ProjectsModel=new ProjectsModel();
        p.name=object.name;
        p.description=object.description;
        p.url=object.url;

        if(object.groupMembers){
            var tmp = object.groupMembers;
            tmp = tmp.substring(1, tmp.length-1);
            p.groupMembers = tmp.split(",")
        }

        //TODO:: maybe need to rewrite
        p.posts=object.posts;

        p.state=object.state;
        p.applicant=object.applicant;
        p.approvedBy=object.approvedBy
        p.dateSubmitted=object.dateSubmitted;
        p.dateUpdated=object.dateUpdated;

        return p;
    }
    toObject():any{
        return {name:this.name,
            description:this.description,
            url:this.url,
            groupMembers:this.groupMembers,
            posts:this.posts,
            state:this.state,
            applicant:this.applicant,
            approvedBy:this.approvedBy,
            dateSubmitted:this.dateSubmitted,
            dateUpdated:this.dateUpdated};
    }
}