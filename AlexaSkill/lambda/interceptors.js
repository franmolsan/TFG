const Alexa = require('ask-sdk-core');
const sync = require("./sync")
const questionManager = require("./handlers/questionManager");
const attributeSetter = require("./setAttributes");


/*
    LoadDataInterceptor
    Loads the persistentAttributes as sessionAttributes whenever a new session is opened
*/
const LoadDataInterceptor = {
    
    async process(handlerInput) {
        
        // if its a new session
        if (Alexa.isNewSession(handlerInput.requestEnvelope)) {
            
            console.log("LOAD DATA interceptor");
            
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = await attributesManager.getSessionAttributes() || {};
            
            const fetchedROOMS = await sync.fetchRooms();
            sessionAttributes.ROOMS = fetchedROOMS;
            
            var userID = await sync.fetchUserID(handlerInput);
            console.log("userID recibido: " + userID);
            
            if(!userID){
                var response = await sync.saveNewUser(handlerInput);
                var parsedResponse = JSON.parse(response);
                sessionAttributes.userID = parsedResponse.userID;
                sessionAttributes.isNewPlayer = true;
            }
            else {
                sessionAttributes.userID = userID;
            }
            
            console.log("in the LoadDataInterceptor, i fetched user id " + sessionAttributes.userID)
            
            attributesManager.setSessionAttributes(sessionAttributes);
            
        }
    }
    
};


/*
    SetGamestateInterceptor
    Saves the gamestate whenever the users changes it
*/
const SetGamestateInterceptor = {
    async process(handlerInput) {
        
        console.log("SET gamestate interceptor");
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()  || {};
        const hasChangedGamestate = sessionAttributes.hasOwnProperty('hasChangedGamestate') ? sessionAttributes.hasChangedGamestate : false;

        if(hasChangedGamestate){
            console.log ("gamestate saved: " + JSON.stringify(sessionAttributes.gamestate))
            var response = await sync.saveGamestate(handlerInput)
        }
        
    }
};

/*
    GetGamestateInterceptor
    Gets the gamestate before handling the request
*/
const GetGamestateInterceptor = {
    async process(handlerInput) {
            

        console.log("GET gamestate interceptor");
        
        const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        // If its not a new player and we have loaded the rooms from the DB
        if (!sessionAttributes.isNewPlayer && sessionAttributes.ROOMS){
            const gamestate = await sync.fetchGamestate(handlerInput);
            
            console.log("fetched gamestate in interceptor " + JSON.stringify(gamestate));
            
            if(gamestate){
                sessionAttributes.hasChangedGamestate = false;
                
                sessionAttributes.gamestate = gamestate;
                handlerInput.attributesManager.setSessionAttributes(sessionAttributes);                
            }
    
        }

        
    }
};


/*
    ClearQuestionInterceptor
    If alexa hasn't asked yes or no, removes the questionAsked in sessionAttributes, to avoid mishandlings
*/
const ClearQuestionInterceptor = {
    
    async process(handlerInput) {
        
        console.log("CLEAR QUESTION INTERCEPTOR");
        
        // if the Intent requested can't ask yes or no,
        // sets the questionAsked to null
        if (Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' && 
            !questionManager.CanAskYesNo(Alexa.getIntentName(handlerInput.requestEnvelope))) {
           attributeSetter.setQuestion(handlerInput,null)
        }
    }
    
};

module.exports = { 
    LoadDataInterceptor: LoadDataInterceptor,
    SetGamestateInterceptor: SetGamestateInterceptor,
    GetGamestateInterceptor: GetGamestateInterceptor,
    ClearQuestionInterceptor: ClearQuestionInterceptor
}
