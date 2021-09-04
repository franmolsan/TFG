const Alexa = require('ask-sdk-core');
const constants = require("../constants") 
const strings = constants.strings;
const httpsRequest = require("../httpsRequest");
const itemAndRoomsManager = require("./itemAndRoomsManager");
const attributesSetter = require("../setAttributes");
const helloScreen = require("../APL/helloScreen.json");
const instructionsScreen = require("../APL/instructionsScreen.json");
const util = require("../util.js")




/*
    LaunchRequestHandler
    Greets the user when they open the skill
*/
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        
        console.log("HANDLER LAUNCH")
        var speakOutput = strings.OPEN_MESSAGE;
        var repromptText = strings.REPROMPT_MESSAGE;
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();

        console.log ("userID: " + sessionAttributes.userID);
         var userIDString = sessionAttributes.userID.toString();
         
        if (sessionAttributes.isNewPlayer){
            
            console.log(userIDString)
           
            var userIDArray = Array.from(userIDString);
            
            // userID speech
            speakOutput += strings.YOUR_USERID_IS_MESSAGE
            userIDArray.forEach(function (item, index) {
                speakOutput +=  item + "<break time=\"1s\"/>"; 
            })


            // speech - pause between sentences
            // so the user can understand it better.
            speakOutput += " " + strings.PREPARE_FIRST_TIME_MESSAGE;
            speakOutput += strings.LANDING_SOUND;
            speakOutput += "<break time=\"1.5s\"/>"
            speakOutput += strings.FIRST_TIME_START_MESSAGE
            speakOutput += "<break time=\"1s\"/>"
            speakOutput += strings.RELEVANT_EVENTS_MESSAGE
            speakOutput += "<break time=\"1s\"/>"
            speakOutput += strings.YOUR_MISSION_IS_MESSAGE
            speakOutput += "<break time=\"1s\"/>"
            speakOutput += strings.GUIDE_MESSAGE
            //speakOutput += strings.INSTRUCTIONS_MESSAGE
            //repromptText = strings.REPROMPT_INSTRUCTION_MESSAGE
            attributesSetter.setInitialGamestate(handlerInput);
             
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            // set question asked 
            //attributesSetter.setQuestion(handlerInput,'HasEntendidoInstrucciones');
            
            sessionAttributes.gamestate.currentRoom = itemAndRoomsManager.searchRoom(handlerInput, "sala inicial");
        }
        
        
        if(util.deviceWithDisplay(handlerInput)){
           return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: "mainScreen",
                document: helloScreen.document,
                datasources: {
                      "myDocumentData": {
                        "title": "Bienvenido a Escapa del Planeta ",
                        "userID":userIDString
                      }
                }
            })
            .reprompt(repromptText)
            .getResponse(); 
        }
        else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse(); 
            
        }

    }
};


/*
    NewPlayerStartIntentHandler
    Sets everything up for the devices test
*/
const NewPlayerStartIntentHandler = {
    
    // can handle only if StartIntent and has not played before
    canHandle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const hasPlayedBefore = sessionAttributes.hasOwnProperty('hasPlayedBefore') ? sessionAttributes.hasPlayedBefore : false;

        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && 
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartIntent' && !hasPlayedBefore;
    },
    async handle(handlerInput) {


        // read qr data
        var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
        var path = '/dev/get-qr-read/qrID1';
        var response = await httpsRequest.Get(host,path);
        var qrTimesRead = response.TimesRead;
        
        
        // read button data 
        path = '/dev/get-button-clicks/2d323b701c2147e6ba38804429720c85'
        response = await httpsRequest.Get(host,path);
        var buttonTimesClicked = response.click;
        var buttonTimesDoubleClicked = response.double_click;
        var buttonTimesHeld = response.hold;
        
        // initialize sessionAttributes with read data
        const sessionAttributes = {
            "buttonTimesClicked": buttonTimesClicked,
            "buttonTimesDoubleClicked":buttonTimesDoubleClicked,
            "buttonTimesHeld":buttonTimesHeld,
            "qrTimesRead":qrTimesRead,
            "hasCheckedButtons": false,
            "hasCheckedQR": false,
            "hasPlayedBefore":true,
            "questionAsked": null,
        }
        
        // save sessionAttributes as persistent
        handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);
        await handlerInput.attributesManager.savePersistentAttributes(); 
    
        // save sessionAttributes for this sesion too
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        // set initialRoom
        const initialRoom = itemAndRoomsManager.searchRoom(handlerInput,'sala inicial')
        attributesSetter.setRoom(handlerInput, initialRoom)
        
        // speech
        const speakOutput = strings.FIRST_TIME_START_MESSAGE
        const repromptText = strings.REPROMPT_MESSAGE

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptText)
            .getResponse();
    }
};

/*
    NewPlayerStartIntentHandler
    Welcomes users
*/
const NotNewPlayerStartIntentHandler = {
    
    // can handle only if StartIntent and has played before
    canHandle(handlerInput) {

        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};

        const hasPlayedBefore = sessionAttributes.hasOwnProperty('hasPlayedBefore') ? sessionAttributes.hasPlayedBefore : false;
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && 
        Alexa.getIntentName(handlerInput.requestEnvelope) === 'StartIntent' && hasPlayedBefore;
    },
    handle(handlerInput) {

        const speakOutput = strings.DEFAULT_START_MESSAGE

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse();
    }
};

/*
    DevicesCheckIntentHandler
    Test to make sure that everything is running smoothly 
    (devices are connected and API is operational)
*/
const DevicesCheckIntentHandler = {

    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'DevicesCheckIntent';
    },

    async handle(handlerInput) {
        
        var speakOutput = "";
        
        // read sessionAttributes
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes() || {};
        var host = 'e5bg757f0e.execute-api.eu-west-1.amazonaws.com';
        
        // if qr system has not been checked yet
        if (!sessionAttributes.hasCheckedQR){
            var path = '/dev/get-qr-read/qrID1';
            
            // make http request
            const response = await httpsRequest.Get(host,path);
            
            // if the qr has been read, mark it as checked
            if (response.TimesRead > sessionAttributes.qrTimesRead){
                sessionAttributes.hasCheckedQR = true;
                attributesManager.setSessionAttributes(sessionAttributes);
                speakOutput += " Se ha leído el código QR correctamente. ";
            }
            
            else {
                speakOutput += " No se ha leído el código QR. ";
            }
        }
        
        
        // if buttons have not been checked yet
        if (!sessionAttributes.hasCheckedButtons){
            path = '/dev/get-button-clicks/2d323b701c2147e6ba38804429720c85';
            
            // make http request 
            const response = await httpsRequest.Get(host,path);
            
            // calculate how many clicks have been made
            const timesClicked = response.click - sessionAttributes.buttonTimesClicked
            const timesDoubleClicked = response.double_click - sessionAttributes.buttonTimesDoubleClicked
            const timesHeld = response.hold - sessionAttributes.buttonTimesHeld
                
            // check standard clicks
            if (timesClicked >= 1){
                speakOutput += "Has hecho " + timesClicked
                if (timesClicked > 1) speakOutput +=" clicks del botón. ";
                else speakOutput +=" click del botón. ";
               
            }
            else {
                speakOutput += " Debes hacer un click estándar del botón.";
            }
            
            // check double clicks
            if (timesDoubleClicked >= 1){
                speakOutput += "Has hecho " + timesDoubleClicked
                if (timesDoubleClicked > 1) speakOutput +=" doble clicks del botón. ";
                else speakOutput +=" doble click del botón. ";
            }
            
            else {
                speakOutput += " Debes hacer un doble click del botón.";
            }
            
            // check long clicks (hold)
            if (timesHeld >= 1){
                speakOutput += "Has mantenido el botón pulsado " + timesHeld
                if (timesHeld > 1) speakOutput +=" veces. ";
                else speakOutput +=" vez. ";
                
            }
            else {
                speakOutput += " Debes realizar una pulsación larga del botón. ";
            }
            
            // if every type of click has been registered,
            // mark buttons as checked
            if (timesClicked >= 1 && timesDoubleClicked >= 1 && timesHeld >= 1){
                speakOutput += " Los botones se han probado correctamente. ";
                sessionAttributes.hasCheckedButtons = true;
                attributesManager.setSessionAttributes(sessionAttributes);
            }
        }
        
        // speech to say whether the test has finished or not
        if (sessionAttributes.hasCheckedQR && sessionAttributes.hasCheckedButtons){
            speakOutput += " Se ha terminado la prueba con éxito. ";
        }
        else {
            speakOutput += " Todavía no ha terminado la prueba. Cuando hayas comprobado todo, vuelve a pedirme que realice la prueba.";
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/*
    InstructionsIntentHandler
    Outputs a message with the game instructions (controls)
*/
const InstructionsIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InstructionsIntent';
    },
    
    handle(handlerInput) {
        
        // set question asked 
        attributesSetter.setQuestion(handlerInput,'HasEntendidoInstrucciones');
        
        // say the instructions
        const speakOutput = strings.INSTRUCTIONS_MESSAGE;
        

          if(util.deviceWithDisplay(handlerInput)){
           return handlerInput.responseBuilder
            .speak(speakOutput)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                token: "mainScreen",
                document: instructionsScreen.document,
                datasources: instructionsScreen.datasources
            })
            .reprompt(strings.REPROMPT_INSTRUCTION_MESSAGE)
            .getResponse(); 
        }
        else {
            return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(strings.REPROMPT_INSTRUCTION_MESSAGE)
            .getResponse();
            
        }
        
  
       
    }
}



/*
    EnterCodeIntentHandler
    Checks the room element that the player asked
*/
const EnterCodeIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'EnterCodeIntent';
    },
    
    handle(handlerInput) {
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
        const door = sessionAttributes.currentDoor;
        
        var speakOutput = "";
        // get the code from the intent slots


        var code;
        var success = new String("ER_SUCCESS_MATCH");
        if (handlerInput.requestEnvelope.request.intent.slots.code.resolutions.resolutionsPerAuthority[0].status.code !== success){
            code = handlerInput.requestEnvelope.request.intent.slots.code.resolutions.resolutionsPerAuthority[0].values[0].value.name
        }
        else {
            code = null;
        }
        
        var isRightCode = (code === door.requiredCode) || false;
        
        console.log("codigo; " + code);
        console.log("isRightCode: " + isRightCode);

        if (isRightCode){
            // get the blockedRooms and delete the room that has been unlocked
            var blockedRooms = sessionAttributes.gamestate.blockedRooms;
            blockedRooms = blockedRooms.filter(item => item !== door.roomName)
            
            // save the gamestate 
            sessionAttributes.gamestate.blockedRooms = blockedRooms;
            sessionAttributes.hasChangedGamestate = true;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            attributesSetter.setDoor(handlerInput,null);
            
            speakOutput += "¡El código era correcto! "
            speakOutput += 'Has abierto la puerta que lleva a ' + door.string + '. ';
        }
        
        else {
            speakOutput += "No ocurre nada. Parece que el código introducido no es correcto. "
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse();
    }
}

/*
    WhatIsInTheInventoryIntentHandler
    Tells the player what's in the inventory
*/
const WhatIsInTheInventoryIntentHandler = {
    
     canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatIsInTheInventoryIntent';
    },
    
    handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes()
        
        // get inventory
        const inventory = sessionAttributes.gamestate.inventory
        
        var speakOutput = "";
        
        // inventory empty or does not exist
        if (inventory === undefined || inventory.length === 0) {
            speakOutput += strings.EMPTY_INVENTORY_MESSAGE
        }
        
        // if not empty, format output with , . y
        else {
            
        speakOutput += strings.NON_EMPTY_INVENTORY_MESSAGE
        
          inventory.forEach((item, index) => {
              speakOutput += item.undefinedString ;
            
              if (index === inventory.length - 2){
                speakOutput += " y "
              }
              else if (index === inventory.length - 1){
                speakOutput += ". "
              }
              else {
                speakOutput += ", "
              }
            });
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(strings.REPROMPT_MESSAGE)
            .getResponse();
    }
}



/*
    HelpIntentHandler
    Outputs a message with help
*/
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = strings.HELP_MESSAGE
        const repromptOutput = strings.HELP_REPROMPT

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(repromptOutput)
            .getResponse();
    }
};

/*
    WhatIsMyUserIDIntentHandler
    Outputs the user ID
*/
const WhatIsMyUserIDIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhatIsMyUserIDIntent';
    },
    handle(handlerInput) {
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        var userIDString = sessionAttributes.userID.toString();
        
        var speakOutput = strings.YOUR_USERID_IS_MESSAGE;
        
        var userIDArray = Array.from(userIDString);
            
        // userID speech
        userIDArray.forEach(function (item, index) {
            speakOutput +=  item + "<break time=\"1s\"/>"; 
        })

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};



/*
    CancelAndStopIntentHandler
    Ends the game (exits the skill)
*/
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = strings.STOP_MESSAGE;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};


const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}, the sessionAttributes were ${JSON.stringify(handlerInput.attributesManager.getSessionAttributes())}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = strings.ERROR_MESSAGE

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};



module.exports = { 
    LaunchRequestHandler: LaunchRequestHandler,
    NewPlayerStartIntentHandler: NewPlayerStartIntentHandler,
    NotNewPlayerStartIntentHandler: NotNewPlayerStartIntentHandler,
    DevicesCheckIntentHandler: DevicesCheckIntentHandler,
    InstructionsIntentHandler: InstructionsIntentHandler,
    WhatIsInTheInventoryIntentHandler: WhatIsInTheInventoryIntentHandler,
    EnterCodeIntentHandler: EnterCodeIntentHandler,
    HelpIntentHandler: HelpIntentHandler,
    WhatIsMyUserIDIntentHandler: WhatIsMyUserIDIntentHandler,
    CancelAndStopIntentHandler: CancelAndStopIntentHandler,
    SessionEndedRequestHandler: SessionEndedRequestHandler,
    IntentReflectorHandler: IntentReflectorHandler,
    ErrorHandler: ErrorHandler
}
