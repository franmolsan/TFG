const Alexa = require('ask-sdk-core');
const constants = require("../constants") 
const strings = constants.strings;
const attributesSetter = require("../setAttributes");
const itemAndRoomsManager = require("./itemAndRoomsManager");



/*
    YesIntentHandler
    Will respond differently depending on the question asked before
    The question asked is saved in the sessionAttributes
*/
const YesIntentHandler = {
    
    // can always handle if the intent is YesIntent
    canHandle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        const sessionAttributes = attributesManager.getSessionAttributes();
        
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        
        var shouldEnd = false;
            
        // get question
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
        const question = sessionAttributes.questionAsked;
        var speakOutput = "";
        
        // clear question in sessionAttributes
        // to avoid any possible mishandlings 
        attributesSetter.setQuestion(handlerInput, null);
        
        // change output speech depending on the question
        if (question === 'HasEntendidoInstrucciones'){
            speakOutput += ' Perfecto. Si en algún momento deseas recordar las instrucciones, pídemelo. ';
        }
        
        else if (question === 'QuieresGuardarItem'){
            
            const item = sessionAttributes.currentItem;
            
            var inventory = sessionAttributes.gamestate.inventory;
            inventory.push(item)
            
            sessionAttributes.gamestate.inventory = inventory;
            sessionAttributes.hasChangedGamestate = true;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            // set item to null in sessionAttributes
            attributesSetter.setItem(handlerInput,null);
            
            speakOutput += ' Perfecto. Has guardado ' + item.definedString + ' en el inventario. ';
        }
        
        else if (question === 'QuieresUsarItem'){
            
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const item = sessionAttributes.currentItem;
            
            
            // use the item
            if (item.isKeyItem){
                speakOutput += itemAndRoomsManager.useKeyItem(handlerInput, item);
            }
            else {
                speakOutput += itemAndRoomsManager.useRegularItem(handlerInput, item);
            }
            
            
            if(item.name === "boton arranque"){
                 shouldEnd = true;
            }
            
            // set item to null in sessionAttributes
            attributesSetter.setItem(handlerInput,null);
            
        }
        
        else if (question === 'QuieresAbrirLaPuertaConItem'){
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const door = sessionAttributes.currentDoor;
            
            // get the blockedRooms and delete the room that has been unlocked
            var blockedRooms = sessionAttributes.gamestate.blockedRooms;
            blockedRooms = blockedRooms.filter(item => item !== door.roomName)
            
            // save the gamestate 
            sessionAttributes.gamestate.blockedRooms = blockedRooms;
            sessionAttributes.hasChangedGamestate = true;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
            attributesSetter.setDoor(handlerInput,null);
            
            speakOutput += ' Has abierto la puerta que lleva a ' + door.string + '. ';
        }
        
        else if (question === 'QuieresAbrirLaPuertaConCodigo'){
            return handlerInput.responseBuilder
            .addDelegateDirective({
                name: 'EnterCodeIntent',
                confirmationStatus: 'NONE',
                slots: {}
            })
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
        }
        
        // no question was asked
        else {
            speakOutput += strings.YES_NO_ERROR_MESSAGE
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withShouldEndSession(shouldEnd)
            .getResponse();
    }
}


/*
    NoIntentHandler
    Will respond differently depending on the question asked before
    The question asked is saved in the sessionAttributes
*/
const NoIntentHandler = {
    
    // can always handle if the intent is NoIntent
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent' ;
    },
    handle(handlerInput) {
        
        // get question
        const question = handlerInput.attributesManager.getSessionAttributes().questionAsked;
        var speakOutput = "";
        
        // clear question in sessionAttributes
        // to avoid any possible mishandlings 
        attributesSetter.setQuestion(handlerInput, null);
        
        // change output speech depending on the question
        if (question === "HasEntendidoInstrucciones"){ 
            speakOutput += 'Te repito las instrucciones: ' + strings.INSTRUCTIONS_MESSAGE;
            
            // the Instructions message ends in a question, so we need to set it
            // to chain the question until the user understands it (answer with a 'yes')
            attributesSetter.setQuestion(handlerInput, 'HasEntendidoInstrucciones');
        }
        
        else if (question === 'QuieresGuardarItem'){
            
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const item = sessionAttributes.currentItem;
            
            speakOutput += ' No has guardado ' + item.definedString + '. ';
            
            // set item to null in sessionAttributes
            attributesSetter.setItem(handlerInput,null);
        }
        
        else if (question === 'QuieresUsarItem'){
            
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const item = sessionAttributes.currentItem;
            
            speakOutput += ' No has usado ' + item.definedString + '. ';
            
                        
            // set item to null in sessionAttributes
           attributesSetter.setItem(handlerInput,null);
        }
        
        else if (question === 'QuieresAbrirLaPuertaConItem'){
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const door = sessionAttributes.currentDoor;
            
            attributesSetter.setDoor(handlerInput,null);
            
            speakOutput += ' No has abierto la puerta que lleva a ' + door.string + '. ';
        }
        
        else if (question === 'QuieresAbrirLaPuertaConCodigo'){
            const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
            const door = sessionAttributes.currentDoor;
            
            attributesSetter.setDoor(handlerInput,null);
            
            speakOutput += ' No has introducido el código para abrir la puerta que lleva a ' + door.string + '. ';
        }
        
        // no question was asked
        else {
            speakOutput += strings.YES_NO_ERROR_MESSAGE
        }
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}


module.exports = { 
    YesIntentHandler: YesIntentHandler,
    NoIntentHandler: NoIntentHandler
}