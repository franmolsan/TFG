const Alexa = require('ask-sdk-core');
const constants = require("../constants"); 
const strings = constants.strings;
const itemAndRoomsManager = require("./itemAndRoomsManager");
const attributeSetter = require("../setAttributes");
const roomScreen = require("../APL/roomScreen.json");
const itemDetailsScreen = require("../APL/itemDetails.json");
const util = require("../util.js")

function describeRoomElements (gamestate){
    
    var room = gamestate.currentRoom;
    var descOutput = "";
    
    if (room.name === "sala 1"){
        
        // output table
        descOutput += "En el centro de la habitación hay una mesa con varios objetos. ";
        
        
        // output  sofa
        descOutput += "Al lado de la mesa hay un sofá. ";
                        
        // output shelf
        descOutput += "En una esquina de la habitación hay una estantería llena de libros. "
        
                                
        // output doors
        descOutput += "También hay tres puertas. Una está detrás tuya, y es por donde has venido de la sala inicial. Hay otra puerta a la izquierda, que lleva a la sala 2. Por último, hay otra puerta a la derecha que lleva a la sala 3. "
        
    }
    
    else if (room.name === "sala 2"){
        
        // if the lights haven't been turned on, don't describe anything else
        if (gamestate.poweredRooms.find(element => element === room.name) === undefined){
            descOutput += "El sistema de iluminación está apagado. No se puede ver nada. Solo están activas las luces de emergencia. Al lado de estas, hay unas ranuras en las que se pueden introducir unas baterías.";
        }
    
        else {
            // output bed
            descOutput += "Al fondo de la habitación, pegada a la pared, hay una cama deshecha. Debajo de la cama hay un cajón. "

            // output wardrobe
            descOutput += "En la pared izquierda hay un pequeño armario. ";
                            
            // output vent duct 
            descOutput += "En la esquina inferior de la pared hay un conducto de ventilación, cerrado. "
        
            // output doors
            descOutput += "También hay dos puertas. Una de ellas dirige a la sala 1. Hay otra puerta a la derecha, que lleva a la sala 3. "
            
            // output hatch
            descOutput += "En el techo hay una escotilla que parece que lleva a la sala de máquinas. Se puede llegar a la escotilla por una escalera."
        }
        
        
    }
    
    else if (room.name === "sala 3"){
        
        // output screens and power
        descOutput += "Al fondo de la sala hay una fuente de alimentación, y conectada a ella, unas grandes pantallas. "
        
        // if the system hasn't been turned on
        if (gamestate.poweredRooms.find(element => element === room.name) === undefined){
            descOutput += "Parece que la fuente de alimentación no está activa. ";
        }
        
        // output screens and power
        descOutput += "En el centro de la sala hay varios equipos médicos: una cama, un escáner de cuerpo y un armario móvil. "
        descOutput += "Pegadas a la pared izquierda hay tres cápsulas de hibernación. "
        
        // output doors
        descOutput += "También hay dos puertas. Una de ellas dirige a la sala 1. Hay otra puerta a la izquierda, que lleva a la sala 2. "
        
        // output hatch
        descOutput += "En el techo hay una escotilla que parece que lleva a la sala de máquinas."
    }
    
    else if (room.name === "sala 4"){
        
        // output screens and power
        descOutput += "En el suelo de la habitación hay dos escotillas, una a la izquierda y otra a la derecha. La de la izquierda lleva a la sala 2, mientras que la de la derecha lleva a la sala 3. "
        descOutput += "En la pared izquierda hay una mesa y al lado hay un compartimento en el que se encuentra el motor de la nave. "
        descOutput += "Debajo de la mesa hay un frigorifico. "
        descOutput += "En la parte derecha se encuentra un ordenador, que parece que controla el sistema de navegación. Al lado hay dos botones: uno para arrancar el motor y otro para iniciar el protocolo de deshibernación. "
        descOutput += "También hay una pequeña caja fuerte, incrustada en un hueco de la pared. "
    }
    
    else {
        descOutput += "No hay ningún objeto interesante en la sala."
    }
    
    return descOutput;
}


function createDataSourceItemForDisplay(handlerInput){
    var datasourceObj = {
        payload : {
            "roomString": "Hello World!"
        }
        
    }
    
    return datasourceObj;
}


/*
    GoToIntentHandler
    Moves the player to the place they want
*/
const GoToIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GoToIntent';
    },
    
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        
        var canShowRoomImage = false;
        var speakOutput = "";
        
        // get the roomName from the intent slots
        const roomName = new String (handlerInput.requestEnvelope.request.intent.slots.room.resolutions.resolutionsPerAuthority[0].values[0].value.name);
        
        // search the room in the ROOMS object
        const room = itemAndRoomsManager.searchRoom(handlerInput, roomName);
        
        // if the room has been found 
        if (room !== null){
            
            // check if the player is already there
            if(room.name === sessionAttributes.gamestate.currentRoom.name) {
                speakOutput += strings.YOU_ARE_ALREADY_THERE_MESSAGE + " " + room.string + ". ";
                canShowRoomImage = true;
            }
            
            // if the player is not there, check if they can go
            else if(itemAndRoomsManager.isThereADoorToGoToRoom(handlerInput, room)){
                
                
                // if there is a door to go to the desired room 
                // and the door is open 
                if (itemAndRoomsManager.doorIsOpen(handlerInput,room.name)){
                    
                    // play sound and inform of the movement
                    speakOutput += "<audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_02\"/>"
                    speakOutput += strings.GO_TO_OK_MESSAGE + " " + room.string + ". ";
                    
                    // if the player hasn't visited the room before
                   if (sessionAttributes.gamestate.visitedRooms.find(element => element === room.name) === undefined){
                       speakOutput += strings.FIRST_TIME_IN_ROOM_MESSAGE[room.name] + " ";
                   }
                   
                   // if they can, set the room in the game state
                    attributeSetter.setRoom(handlerInput,room)
                   
                   canShowRoomImage = true;
                }
                
                // the door is locked
                else {
                    speakOutput += strings.GO_TO_ERROR_MESSAGE + " " + room.string + ". " + 
                    strings.LOCKED_ROOM_MESSAGE;
                }
                
            }
            
            // if they can't go, tell them
            else {
                speakOutput += strings.GO_TO_ERROR_MESSAGE + " " + room.string + ". ";
            }
        }
        
        // the room hasn't been found in the ROOMS object
        else {
           speakOutput += strings.ROOM_NOT_FOUND_MESSAGE;
        }

        // only show the room image if the user is the room or can move to it
        if(util.deviceWithDisplay(handlerInput) && canShowRoomImage){
            
            // if it's the second room, if the lights are off, there can't be any image
            // if the lights haven't been turned on, don't describe anything else
            if (room.name === "sala 2") {
                if(sessionAttributes.gamestate.poweredRooms.find(element => element === room.name) === undefined){
                    room.img = "https://escapemedia.s3.eu-west-1.amazonaws.com/imagenesJuego/darkRoom.jpeg"
                    console.log("room img has changed : " + room.img)
                }
                else{
                    room.img = "https://escapemedia.s3.eu-west-1.amazonaws.com/imagenesJuego/sala2.png"
                    console.log("room img has changed : " + room.img)
                }
            }
            

           return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: roomScreen.document ,
                datasources: {
                  "roomData": {
                    "roomName": room.formattedName,
                    "roomImage": room.img
                  }
                }
            })
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse(); 
        }
        else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }

    }
}

/*
    WhereAmIIntentHandler
    Tells the player where they are
*/
const WhereAmIIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhereAmIIntent';
    },
    
    handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        
        // get the currentRoom from the sessionAttributes
        const room = sessionAttributes.gamestate.currentRoom
        
        // output the currentRoom
        var speakOutput = strings.WHERE_IS_MESSAGE + room.string
        
        // only show the room image if the user is the room or can move to it
        if(util.deviceWithDisplay(handlerInput)){
            
            // if it's the second room, if the lights are off, there can't be any image
            // if the lights haven't been turned on, don't describe anything else
            if (room.name === "sala 2" &&
                sessionAttributes.gamestate.poweredRooms.find(element => element === room.name) === undefined){
                room.img = "https://escapemedia.s3.eu-west-1.amazonaws.com/imagenesJuego/darkRoom.jpeg"
                console.log("room img has changed : " + room.img)
            }
            
           return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: roomScreen.document ,
                datasources: {
                  "roomData": {
                    "roomName": room.formattedName,
                    "roomImage": room.img
                  }
                }
            })
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse(); 
        }
        else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }
    }
}

/*
    WhereCanIGoIntentHandler
    Tells the player where can they go
*/
const WhereCanIGoIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhereCanIGoIntent';
    },
    
    handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        
        // get the doors in the currentRoom
        const doors = sessionAttributes.gamestate.currentRoom.elements.doors
        
        // output all the rooms the player can go to
        var speakOutput = strings.CAN_GO_TO_MESSAGE
        
        const ObjKeys = Object.keys(doors)
        ObjKeys.forEach((key, index) => {
            speakOutput += doors[key].string;
            
            if (index === ObjKeys.length - 2){
                speakOutput += " y "
            }
            else if (index === ObjKeys.length - 1){
                speakOutput += " . "
            }
            else {
                speakOutput += " , "
            }
        });
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

/*
    RoomDescriptionIntentHandler
    Describes the room where the player is.
*/
const RoomDescriptionIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'RoomDescriptionIntent';
    },
    
    handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        
        // get the currentRoom from the sessionAttributes
        const room = sessionAttributes.gamestate.currentRoom
        
        // output the currentRoom
        var speakOutput = strings.WHERE_IS_MESSAGE + room.string + ". " 
        
        speakOutput += describeRoomElements(sessionAttributes.gamestate)
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

/*
    CheckElementIntentHandler
    Checks the room element that the player asked
*/
const CheckElementIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'CheckElementIntent';
    },
    
    handle(handlerInput) {
        
            
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        const currentRoom = sessionAttributes.gamestate.currentRoom;
        
        // get the element from the intent slots
        const elementName = new String (handlerInput.requestEnvelope.request.intent.slots.element.resolutions.resolutionsPerAuthority[0].values[0].value.name);
        
        var speakOutput = "";
        var element;
        
        // if it's a door
        if (elementName.startsWith("puerta")){
            
            // find the door
            element = itemAndRoomsManager.getDoorInPlace(currentRoom,elementName);
            console.log("Found door " + JSON.stringify(element));
            speakOutput += itemAndRoomsManager.doorInteraction(handlerInput, element)
        }
        
        // if it's a regular item (not a door)
        else {
            // find the item 
            element = itemAndRoomsManager.getItemInPlace(currentRoom,elementName);
            console.log ("Found item " + JSON.stringify(element));
            
            // if its the first drawer (it can show a QR code)
            if (element.name === "primer cajon"){
                
                // check if the drawer has been opened
                var drawerState = sessionAttributes.gamestate.button2TimesClicked;
                
                // if it has been opened, we need to show another img (the QR code)
                if (drawerState >= 1){
                    element.img = "https://escapemedia.s3.eu-west-1.amazonaws.com/imagenesJuego/qre4e5.png"
                }

            }
            else if (element.name === "capsulas regeneracion"){
                var usedItems = sessionAttributes.gamestate.usedItems;
                var hasPressedUnhibernationButton = usedItems.find(element => element === "boton deshibernacion")
                
                if(hasPressedUnhibernationButton){
                    element.img = "https://escapemedia.s3.eu-west-1.amazonaws.com/imagenesJuego/qre6.png"
                }
                
            }
    
            speakOutput += itemAndRoomsManager.itemInteraction(handlerInput, element)
        }
        
        
        if(util.deviceWithDisplay(handlerInput)){
            
           return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: itemDetailsScreen.document ,
                token: "itemDetailsScreen",
                datasources: {
                    "elementDetails": {
                        "roomName":currentRoom.name,
                        "elementName": element.formattedName,
                        "elementDesc": speakOutput,
                        "imageSourceURL": element.img
                      }
                }
                
            })
            .reprompt(speakOutput)
            .getResponse(); 
        }
        else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse();
        }
        

    }
}

module.exports = { 
    describeRoomElements: describeRoomElements,
    GoToIntentHandler: GoToIntentHandler,
    WhereAmIIntentHandler: WhereAmIIntentHandler,
    WhereCanIGoIntentHandler: WhereCanIGoIntentHandler,
    RoomDescriptionIntentHandler: RoomDescriptionIntentHandler,
    CheckElementIntentHandler: CheckElementIntentHandler
}