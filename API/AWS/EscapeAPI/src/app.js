require('dotenv').config();

const express = require('express');

// const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const CONNECTION_URL = "mongodb+srv://admin:cjlnQkcojogSotoS@cluster0.gzt07.mongodb.net/buttons?retryWrites=true&w=majority" //process.env.MONGO_CONNECTION_URL;
const DATABASE_NAME = "buttons" //process.env.DATABASE_NAME;

const app = express();
const port = 3000;

app.use(express.urlencoded({extended: true}));
app.use(express.json()) 

const router = express.Router()
const cors = require('cors')

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))


/*
app.listen(port, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collectionButtonClicks = database.collection("button_clicks");
        collectionQR = database.collection("qr");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });
});
*/

MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
    if(error) {
        throw error;
    }
    database = client.db(DATABASE_NAME);
    collectionButtonClicks = database.collection("button_clicks");
    collectionQR = database.collection("qr");
    console.log("Connected to `" + DATABASE_NAME + "`!");
});

router.get('/', (req, res) => res.send('Hello World!'));


router.get("/get-button-clicks/:id", (request, response) => {

    var buttonID = request.params.id;
    console.log(buttonID)
    
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

router.get("/get-button-clicks/:id/type/:clickType", (request, response) => {

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

router.post("/button-click", (request, response) => {

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

router.post("/qr-read", (request, response) => {

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

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
