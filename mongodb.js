//CRUD: Create Read Update Delete

const {MongoClient , ObjectID} = require('mongodb');

const connectionUrl = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

MongoClient.connect(connectionUrl, {useNewUrlParser: true , useUnifiedTopology: true} , (error,client)=>{
    if(error){
        return console.log("Unable to connect to DB");
    }

    const db = client.db(databaseName);

    db.collection("users").deleteMany({
        age: 1
    }).then( (result)=>{
        console.log(result);
    }).catch( (error)=>{
        console.log(error);
    });;



});