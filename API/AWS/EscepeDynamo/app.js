const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const MongoClient = require("mongodb").MongoClient;
const CONNECTION_URL = "mongodb+srv://admin:cjlnQkcojogSotoS@cluster0.gzt07.mongodb.net/buttons?retryWrites=true&w=majority" //process.env.MONGO_CONNECTION_URL;
const DATABASE_NAME = "buttons" //process.env.DATABASE_NAME;
const app = express();
app.use(bodyParser.json({ strict: false }));


// Once we connect to the database once, we'll store that connection
// and reuse it so that we don't have to connect to the database on every request.
let cachedDb = null;


async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  // Connect to our MongoDB database hosted on MongoDB Atlas
  const client = await MongoClient.connect(CONNECTION_URL);

  // Specify which database we want to use
  cachedDb = await client.db("buttons");

  return cachedDb;
}


app.get('/', (req, res) => res.send('Hello World!'));


app.get("/get-button-clicks/:id", (request, response) => {

    var buttonID = request.params.id;
    console.log(buttonID)

    // Get an instance of our database
    const db = await connectToDatabase();
    const collectionButtonClicks = await db.collection("button_clicks")
    
    collectionButtonClicks.findOne({"buttonID": buttonID}, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        if (result == null) {
            response.send("Ese botón no ha sido encontrado");
        }
        else {
            response.send(result);
        }
    });
    

});

app.get("/get-button-clicks/:id/type/:clickType", (request, response) => {

    var buttonID = request.params.id;
    var clickType = request.params.clickType;
    console.log(buttonID + " " + clickType)

    collectionButtonClicks.findOne({"buttonID": buttonID},{projection: {[clickType]:1, _id:0}} , (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        if (result == null) {
            response.send("Ese botón no ha sido encontrado");
        }
        else {
            //console.log(result[clickType])
            response.send(result);
        }
    });

});

app.post("/button-click", (request, response) => {

    var clickType = request.body.clickType;

    console.log(clickType)
    
    collectionButtonClicks.updateOne({ "serialNumber":request.body.serialNumber }, {"$inc": { [clickType] : 1} }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        if (result == null) {
            response.send("No se pudo incrementar correctamente");
        }
        else {
            response.send("Incremento correcto");
        }
    });

});

app.post("/qr-read", (request, response) => {

    var qrID = request.body.qrID;

    console.log("lectura qr " + qrID)
    
    collectionQR.updateOne({ "qrID":request.body.qrID }, { $inc: { "timesRead": 1 } }, (error, result) => {
        if (error) {
            return response.status(500).send(error);
        }
        if (result == null) {
            response.send("No se pudo incrementar correctamente");
        }
        else {
            response.send("Incremento correcto");
        }
    });

});


module.exports.handler = serverless(app);