const { moduleExport } = require("es-checker");

class Perosn{

constructor(name="",age=10){
    this.name=name;
    this.age = age;
}

toJSON(){
 name:this.name;
 age:this.name;
}

toString(){
    return JSON.stringify(this,null,4)
}

}

module.exports = Perosn;

