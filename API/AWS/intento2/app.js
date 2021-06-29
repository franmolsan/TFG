const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
var AWS = require('aws-sdk');
const db =  "buttons";


AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: "eu-west-1",
    endpoint: process.env.endpoint,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

const port = 3000;
const app = express();

app.use(express.json({ strict: false }));

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});


app.get('/', (req, res) => res.send('Hello World!'));


app.get("/get-button-clicks/:id", (request, response) => {

    const buttonID = request.params.id;
    console.log(buttonID)
    
    /*
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
    */

    var params = {
        TableName : db,
        Key: {
            buttonID: buttonID
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send({ item: result.Item });
        }
     });

});

/*
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
*/
module.exports.handler = serverless(app);