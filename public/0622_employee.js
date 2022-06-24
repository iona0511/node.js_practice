const { moduleExport } = require("es-checker");
const Perosn = require ("./0622_person");

class Empolyee extends Perosn{
    constructor(name="",age=20,member_id=""){
        super(name,age)
        this.member_id = member_id;
    }

    toJSON(){
        const{name,age,member_id}=this;
        return {name,age,member_id};
    }
}

module.exports = Empolyee;