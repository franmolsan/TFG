// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');


const interceptors = require("./interceptors");
const mainHandlers = require("./handlers/mainHandlers");
const questionHandlers = require("./handlers/questionHandlers");
const roomAndMovementHandlers = require("./handlers/roomAndMovementHandlers");



// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.

exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        mainHandlers.LaunchRequestHandler,
        mainHandlers.NewPlayerStartIntentHandler,
        mainHandlers.NotNewPlayerStartIntentHandler,
        mainHandlers.InstructionsIntentHandler,
        roomAndMovementHandlers.GoToIntentHandler,
        roomAndMovementHandlers.WhereAmIIntentHandler,
        roomAndMovementHandlers.WhereCanIGoIntentHandler,
        roomAndMovementHandlers.RoomDescriptionIntentHandler,
        roomAndMovementHandlers.CheckElementIntentHandler,
        mainHandlers.WhatIsInTheInventoryIntentHandler,
        questionHandlers.YesIntentHandler,
        questionHandlers.NoIntentHandler,
        mainHandlers.DevicesCheckIntentHandler,
        mainHandlers.EnterCodeIntentHandler,
        mainHandlers.WhatIsMyUserIDIntentHandler,
        mainHandlers.HelpIntentHandler,
        mainHandlers.CancelAndStopIntentHandler,
        mainHandlers.SessionEndedRequestHandler,
        mainHandlers.IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(
        interceptors.LoadDataInterceptor,
        interceptors.GetGamestateInterceptor,
        interceptors.ClearQuestionInterceptor,
    )
    .addResponseInterceptors(
        interceptors.SetGamestateInterceptor,
    )
    .addErrorHandlers(
        mainHandlers.ErrorHandler,
    )
    .withPersistenceAdapter(
        new persistenceAdapter.S3PersistenceAdapter({bucketName:process.env.S3_PERSISTENCE_BUCKET})
    )
    .lambda();
