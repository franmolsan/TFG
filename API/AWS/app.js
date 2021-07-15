const serverless = require('serverless-http');
const express = require('express');
const bodyParser = require('body-parser');
var AWS = require('aws-sdk');
const dbButtons =  "buttons";
const dbQR =  "qrTabla";
const dbRooms =  "gameRooms";
const dbGameStates = "gameStates"

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
app.use(bodyParser.json({ limit: '1024mb', extended: true }));
app.use(bodyParser.urlencoded({limit:'1024mb', extended: true }));

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});

const scanTable = async (tableName) => {
    const params = {
        TableName: tableName,
    };

    const scanResults = [];
    var items;
    do{
        items = await dynamoDb.scan(params).promise();
        items.Items.forEach((item) => scanResults.push(item));
        params.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey !== "undefined");
    
    return scanResults;

};

app.get('/', (req, res) => res.send('Hello World!'));


app.get("/get-button-clicks/:id", (request, response) => {

    const buttonID = request.params.id;
    
    var params = {
        TableName : dbButtons,
        Key: {
            buttonID: buttonID
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send(result.Item);
        }
     });

});


app.get("/get-button-clicks/:id/type/:clickType", (request, response) => {

    var buttonID = request.params.id;
    var clickType = request.params.clickType;

    var params = {
        TableName : dbButtons,
        Key: {
            buttonID: buttonID
        },
        AttributesToGet: [clickType]
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send(result.Item);
        }
     });

});

app.post("/button-click", (request, response) => {

    var clickType = request.body.clickType;
    var buttonID = request.body.buttonID

    var params = {
        TableName : dbButtons,
        Key: {
            buttonID: buttonID,
        },
        UpdateExpression: "set #clickType = #clickType + :val",
        ExpressionAttributeNames: {
            "#clickType": clickType
        },
        ExpressionAttributeValues:{
            ":val": 1
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamoDb.update(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send("Button succesfully clicked");
        }
     });

});

app.post("/qr-read", (request, response) => {

    var qrID = request.body.qrID;
    
    var params = {
        TableName : dbQR,
        Key: {
            qrID: qrID,
        },
        UpdateExpression: "set TimesRead = TimesRead + :val",
        ExpressionAttributeValues:{
            ":val": 1
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamoDb.update(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).send(request.body);
        } else {
            response.status(200).send("QR code succesfully read");
        }
     });

});

app.get("/get-qr-read/:id", (request, response) => {

    var qrID = request.params.id;
    
    var params = {
        TableName : dbQR,
        Key: {
            qrID: qrID,
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send(result.Item);
        }
     });

  
});


app.get("/get-game-rooms", (request, response) => {

    const params = {
        TableName: dbRooms
    };

    dynamoDb.scan(params, function (err, data) {
        if (err) {
          console.log("Error", err);
          response.status(500).json({ error: err });
        } else {
          console.log("Success", data);
          response.status(200).send(data.Items);
        }
      });
});


app.get("/get-gamestate/:id", (request, response) => {

    const GameID = request.params.id;
    
    var params = {
        TableName : dbGameStates,
        Key: {
            GameID: GameID
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send(result.Item);
        }
     });

});

app.post("/save-gamestate", (request, response) => {

    const GameID = request.body.GameID;
    const inventory = request.body.inventory;
    const blockedRooms = request.body.blockedRooms;
    const currentRoom = request.body.currentRoom;
    
    var params = {
        TableName : dbGameStates,
        Key: {
            GameID: GameID,
        },
        UpdateExpression: "set inventory = :i,  blockedRooms = :b, currentRoom = :c",
        ExpressionAttributeValues:{
            ":i": inventory,
            ":b": blockedRooms,
            ":c": currentRoom
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamoDb.update(params, (error, result) => {
        if (error) {
           console.log(error);
           response.status(500).send(request.body);
        } else {
            response.status(200).send("Game state succesfully updated");
        }
     });

});


module.exports.handler = serverless(app);