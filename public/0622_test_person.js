const Perosn = require("./0622_person")

const f1 = new Perosn ("David")
const f2 = new Perosn ("Bill",80)

console.log(f1)
console.log(JSON.stringify(f2,null,4))