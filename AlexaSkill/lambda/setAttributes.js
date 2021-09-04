


/*
    setQuestion function
    Useful to set a context for a question
*/
function setQuestion(handlerInput, questionAsked) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.questionAsked = questionAsked;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
}

/*
    setDoor function
    sets the door that the user is trying to open in the sessionAttributes
*/
function setDoor(handlerInput, door) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.currentDoor = door;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}


/*
    setRoom function
    Sets current room in sessionAttributes
*/
function setRoom (handlerInput, room) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.gamestate.currentRoom = room
  
  // if the player hasn't visited the room before, add the room to the visitedRooms array
   if (sessionAttributes.gamestate.visitedRooms.find(element => element === room.name) === undefined){
       sessionAttributes.gamestate.visitedRooms.push(room.name);
   }
    
  sessionAttributes.hasChangedGamestate = true;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
}


/*
    setItem function
    sets the current item in the sessionAttributes
*/
function setItem(handlerInput, item) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  sessionAttributes.currentItem = item;
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  console.log("currentItem : " + JSON.stringify(sessionAttributes.currentItem));
}


/*
    setInitialGamestate function
    sets the gamestate for a new player
*/
function setInitialGamestate(handlerInput) {
  const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
  
  const gamestate = {
        "inventory" : new Array() ,
        "visitedRooms":[],
        "blockedRooms": ["sala 2", "sala 3", "sala 4"],
        "currentRoomName":  "sala inicial",
        "poweredRooms": new Array(),
        "unlockedElements": new Array(),
        "usedItems": new Array(),
        "motorState": "unplugged"
    }
    
    sessionAttributes.gamestate = gamestate;
    sessionAttributes.hasChangedGamestate = true;
  
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    console.log("Initial gamestate: " + JSON.stringify(sessionAttributes.gamestate));
}


module.exports = { 
    setQuestion: setQuestion,
    setRoom: setRoom,
    setDoor: setDoor,
    setItem: setItem,
    setInitialGamestate: setInitialGamestate
}
    