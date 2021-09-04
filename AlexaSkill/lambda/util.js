const AWS = require('aws-sdk');

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4',
    region: process.env.S3_PERSISTENCE_REGION
});

/*
    deviceWithDisplay function
    Checks wheter the device has a display or not
*/
function deviceWithDisplay(handlerInput){
    var hasDisplay = handlerInput &&
    handlerInput.requestEnvelope &&
    handlerInput.requestEnvelope.context &&
    handlerInput.requestEnvelope.context.System &&
    handlerInput.requestEnvelope.context.System.device &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
    handlerInput.requestEnvelope.context.System.device.supportedInterfaces.hasOwnProperty('Alexa.Presentation.APL') 
    
    console.log("device has display " + hasDisplay);
    return hasDisplay;
}


module.exports = { 
    deviceWithDisplay:deviceWithDisplay
}