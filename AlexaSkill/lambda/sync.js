const httpsRequest = require("./httpsRequest")
const Alexa = require('ask-sdk-core');
const itemAndRoomsManager = require("./handlers/itemAndRoomsManager")


async function fetchRooms(){
    
    // fetch the game rooms from the game API
    var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
    var path = '/dev/get-game-rooms'
    var ROOMS = await httpsRequest.Get(host,path);
    
    return ROOMS;
}

async function fetchUserID(handlerInput){
    
    const amazonUserId = Alexa.getUserId(handlerInput.requestEnvelope)
    
    // fetch the game rooms from the game API
    var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
    var path = '/dev/get-userId/' + amazonUserId
    const userIDObject = await httpsRequest.Get(host,path);
    
    console.log("userIDObject response: " + JSON.stringify(userIDObject));
    
    var userID = userIDObject.userID;
    if (!userID) userID = null;
    
    console.log("userID response: " + userID);
    return userID;
}

async function fetchGamestate(handlerInput){

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const userID = sessionAttributes.userID;
    console.log("user id " + userID)
    
    var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
    var path = '/dev/get-gamestate/' + userID;
    const gameState = await httpsRequest.Get(host,path);
    
    console.log(gameState);
    
    // search the actual room (we only saved the name)
    if (gameState){
        gameState.currentRoom = itemAndRoomsManager.searchRoom(handlerInput,gameState.currentRoomName)
    }
    
    return gameState;
}

async function saveGamestate(handlerInput){
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    /*
    const gameState = {
        "inventory" : sessionAttributes.gamestate.inventory || [],
        "visitedRooms":sessionAttributes.gamestate.visitedRooms || [],
        "blockedRooms": sessionAttributes.gamestate.blockedRooms || {},
        "currentRoomName": sessionAttributes.gamestate.currentRoom.name || "sala inicial",
        "poweredRooms":sessionAttributes.gamestate.poweredRooms || [],
        "unlockedElements":sessionAttributes.gamestate.unlockedElements || {},
        "usedItems": sessionAttributes.gamestate.usedItems || {},
        "motorState": sessionAttributes.gamestate.motorState || {},
        "GameID": sessionAttributes.userID
    }
    */
    
    const gameState = {
        "inventory" : sessionAttributes.gamestate.inventory ,
        "visitedRooms":sessionAttributes.gamestate.visitedRooms,
        "blockedRooms": sessionAttributes.gamestate.blockedRooms,
        "currentRoomName": sessionAttributes.gamestate.currentRoom.name,
        "poweredRooms":sessionAttributes.gamestate.poweredRooms,
        "unlockedElements":sessionAttributes.gamestate.unlockedElements,
        "usedItems": sessionAttributes.gamestate.usedItems,
        "motorState": sessionAttributes.gamestate.motorState,
        "GameID": sessionAttributes.userID
    }
    
    console.log("SAVING GAMESTATE : " + JSON.stringify(gameState))
    
    // fetch the game rooms from the game API
    var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
    var path = '/dev/save-gamestate'
    var response = await httpsRequest.Post(host,path,gameState);
    
    return response;
}

async function saveNewUser(handlerInput){
    
    const amazonUserIdObject = {"AmazonUserID": Alexa.getUserId(handlerInput.requestEnvelope)}
    
    console.log("SAVING new user : " + Alexa.getUserId(handlerInput.requestEnvelope))
    
    // fetch the game rooms from the game API
    var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
    var path = '/dev/register-new-user'
    var response = await httpsRequest.Post(host,path,amazonUserIdObject);
    
    console.log("response saving new user: " + response);
    
    return response;
}

module.exports = { 
    fetchUserID: fetchUserID,
    fetchRooms: fetchRooms,
    fetchGamestate: fetchGamestate,
    saveGamestate: saveGamestate,
    saveNewUser:saveNewUser
}