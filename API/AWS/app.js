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


// POST Request to register button clicks
app.post("/button-click", (request, response) => {

    // get which button has been clicked
    // and the click type (long, short, double)
    var clickType = request.body.clickType;
    var buttonID = request.body.buttonID

    // DB update params
    var params = {

        // query the button by its ID
        TableName : dbButtons,
        Key: {
            buttonID: buttonID,
        },

        // increment click counter
        UpdateExpression: "set #clickType = #clickType + :val",
        ExpressionAttributeNames: {
            "#clickType": clickType
        },
        ExpressionAttributeValues:{
            ":val": 1
        },
        ReturnValues:"UPDATED_NEW"
    };

    // use the DynamoDB object provided by the AWS SDK
    dynamoDb.update(params, (error, result) => {

        // if there has been an error, log it
        if (error) {
           console.log(error);
           response.status(500).json({ error: error });
        } else {
            // if everything worked, send succesful message
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
    request.setEncoding('utf8');
    console.log("getting game rooms");
    const params = {
        TableName: dbRooms
    };

    dynamoDb.scan(params, function (err, data) {
        if (err) {
          console.log("get game rooms Error" + err);
          response.status(500).json({ error: err });
        } else {
          console.log("Success", data);
          response.status(200).send(data.Items);
        }
      });
});


app.get("/get-gamestate/:id", (request, response) => {
    request.setEncoding('utf8');
    console.log("getting gamestate");
    const GameID = request.params.id;
    
    var params = {
        TableName : dbGameStates,
        Key: {
            GameID: GameID
        }
    };

    dynamoDb.get(params, (error, result) => {
        if (error) {
           console.log("get gamestate error " + error);
           response.status(500).json({ error: error });
        } else {
            response.status(200).send(result.Item);
        }
     });

});

// POST Request to register a gamestate
app.post("/save-gamestate", (request, response) => {
    request.setEncoding('utf8');
    
    // get all the gamestate fields
    const GameID = request.body.GameID;
    const inventory = request.body.inventory;
    const blockedRooms = request.body.blockedRooms;
    const visitedRooms = request.body.visitedRooms;
    const currentRoomName = request.body.currentRoomName;
    const poweredRooms = request.body.poweredRooms;
    const unlockedElements = request.body.unlockedElements;
    const usedItems = request.body.usedItems;
    const motorState = request.body.motorState;
    
    // DB update params
    var params = {
        TableName : dbGameStates,
        Key: {
            // query the gamestate by its ID
            GameID: GameID,
        },
        // update all the gamestate fields
        UpdateExpression: "set inventory = :i,  blockedRooms = :b, currentRoomName = :c, visitedRooms = :v, poweredRooms = :p, unlockedElements = :u, usedItems = :ui, motorState = :m ",
        ExpressionAttributeValues:{
            ":i": inventory,
            ":b": blockedRooms,
            ":c": currentRoomName,
            ":v": visitedRooms,
            ":p": poweredRooms,
            ":u": unlockedElements,
            ":ui": usedItems,
            ":m": motorState
        },
        ReturnValues:"UPDATED_NEW"
    };

    // use the DynamoDB object provided by the AWS SDK
    dynamoDb.update(params, (error, result) => {
        if (error) {
            // if there has been an error, log it
           console.log("saving gamestate error " + error);
           response.status(500).send(error);
        } else {
            // if everything worked, send succesful message
            response.status(200).send(result.Attributes);
        }
     });

});


module.exports.handler = serverless(app);