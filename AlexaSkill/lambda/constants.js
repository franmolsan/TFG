const strings = {
    SKILL_NAME: 'Escapa del planeta',
    OPEN_MESSAGE: 'Hola, has abierto la skill Escapa del Planeta. ',
    HELP_MESSAGE: 'Si no sabes qué hacer, puedes pedirme las instrucciones. Recuerda que puedes preguntar dónde estás o adónde puedes ir. Te recomiendo que examines todos los elementos de las salas.',
    YOUR_USERID_IS_MESSAGE: 'Tu identificador de usuario es ',
    HELP_REPROMPT: 'Te dejo pensar. Recuerda que puedes pedirme ayuda o las instrucciones en cualquier momento. ',
    ERROR_MESSAGE: 'No he entendido lo que me has pedido. Prueba a repetirlo.',
    YES_NO_ERROR_MESSAGE: 'Creo que no te había hecho ninguna pregunta. Prueba a decirlo de otra forma',
    STOP_MESSAGE: '¡Hasta luego!',
    LANDING_SOUND: '<audio src="soundbank://soundlibrary/aircrafts/futuristic/futuristic_04"/>',
    FIRST_TIME_START_MESSAGE: "Hola, explorador. Veo que acabas de llegar a la nave naufragada que buscábamos. " +
            "Ahora debemos explorarla para averiguar por qué emitía señales de ayuda. " +
            "Perdona, hace mucho que no hablábamos. Tras el largo viaje intergaláctico, es posible que no te acuerdes de mí. " +
            "Soy tu asistente personal que se encarga de ayudarte en las misiones de exploración. ",
    REPROMPT_MESSAGE:'Te dejo pensar lo que quieres hacer. Recuerda que puedes pedirme las instrucciones en cualquier momento. ' ,
    DEFAULT_START_MESSAGE: 'Bienvenido de nuevo a Escapa del Planeta.',
    INSTRUCTIONS_MESSAGE: 'Si quieres ir a algún sitio, di: ir a lugar. Puedo recordarte dónde estás si me preguntas: donde estoy? '+
    'Si quieres que describa el lugar en el que estás, pídeme que describa la sala. '+
    'Si no sabes dónde ir, pregunta: dónde puedo ir? y te diré tus opciones. '+
    'Puedes examinar tu inventario diciendo: qué tengo en mi inventario? '+
    'Si quieres examinar un objeto, di: examinar objeto o agarrar objeto. '+ 
    'En cualquier momento puedes pedirme ayuda diciendo: Necesito ayuda . ¿Te ha quedado claro? ',
    REPROMPT_INSTRUCTION_MESSAGE:'¿Quieres que repita las instrucciones? ',
    RELEVANT_EVENTS_MESSAGE: 'Estamos en el año 2199. Se ha producido un accidente durante la exploración del planeta XP-2917. ' +
    ' La vida de los integrantes de la Nave de Exploración Felicity está en peligro. Se encuentran en las cápsulas de hibernación.',
    GO_TO_OK_MESSAGE : 'Ahora estás en ',
    GO_TO_ERROR_MESSAGE: 'No puedes ir a ',
    YOU_ARE_ALREADY_THERE_MESSAGE: 'Ya estás en ',
    ROOM_NOT_FOUND_MESSAGE: 'No he entendido adonde quieres ir. Prueba a repetirlo.  ',
    CAN_GO_TO_MESSAGE: 'Puedes ir ',
    LOCKED_ROOM_MESSAGE: 'La puerta está bloqueada. ',
    WHERE_IS_MESSAGE: 'Estás en ',
    EMPTY_INVENTORY_MESSAGE: 'Todavía no has guardado nada en el inventario. ',
    NON_EMPTY_INVENTORY_MESSAGE: 'En el inventario hay ',
    TAKEOFF_SOUND: '<audio src="soundbank://soundlibrary/transportation/amzn_sfx_airplane_takeoff_whoosh_01"/>',
    ENDGAME_GOOD: 'La nave ha despegado correctamente y el motor funciona a máxima potencia. Ahora solo queda esperar. <break time="2s"/> Hemos llegado sanos y salvos. La nave está en perfecto estado. <amazon:emotion name="excited" intensity="medium">  La misión ha sido todo un éxito. </amazon:emotion>',
    ENDGAME_MEDIUM: 'La nave ha despegado correctamente, aunque el motor no está al cien por cien. Ahora solo queda esperar. <break time="3s"/> Hemos llegado sanos y salvos, aunque la nave se ha destrozado en el viaje. <<amazon:emotion name="excited" intensity="low">  La misión ha sido todo un éxito. </amazon:emotion>', 
    ENDGAME_BAD: 'La nave ha despegado a duras penas. Parece que el motor está muy dañado... aunque ya poco se puede hacer. Ahora solo queda esperar. <break time="3s"/> <amazon:emotion name="excited" intensity="medium"> El motor ha dejado de funcionar. Nos hemos quedado a la deriva. </amazon:emotion>',

    FIRST_TIME_IN_ROOM_MESSAGE: {
        
        "sala inicial":
             ""
        ,
        
        "purificador": "Quédate quieto, va a empezar el proceso de purificación. " + " <audio src=\"soundbank://soundlibrary/air/steam/steam_05\"/>" + " Ya ha terminado.",
        
        "sala 1": "Esta parece la sala principal de la nave. Seguro que la tripulación pasaba mucho tiempo aquí. " + 
        " <audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_04\"/> "+
        " Se ha cerrado la puerta de la nave. Parece que nos hemos quedado encerrados. "
        ,
        
        "sala 2": "¡El sistema de iluminación no funciona! ¡No se ve nada! " +
        "Se han encendido unas pequeñas luces de emergencia a la derecha. A su lado hay unas ranuras para baterías. Quizás si las conectamos, la iluminación funcione de nuevo. "
        ,
        
        "sala 3": "Esta es la sala médica de la nave. Está repleta de artilugios intersantes, aunque parecen algo anticuados."
        ,
        
        "sala 4": "Esto parece ser la sala de máquinas. ¡Por fin hemos llegado! " +
        "Espera, parece que los sistemas de navegación no están activos. Quizás si arrancas el motor, empiece a funcionar todo. "
        
    },
    HINT_BROKEN_ENGINE_NO_KEY_ITEMS: 'Si tuvieras algunas herramientas especiales o supieras qué le pasa, podrías arreglarlo. ',
    DESHIBERNATION_PROCCESS_STARTED:'<audio src="soundbank://soundlibrary/scifi/amzn_sfx_scifi_sheilds_up_01"/> Parece que ha empezado el proceso. Quizás se estén abriendo las cápsulas de híper-hibernación. '

};


const IntentsCanAskYesNo = ['AMAZON.YesIntent', 'AMAZON.NoIntent', 'InstructionsIntent', 'CheckItemIntent']

module.exports = { 
    IntentsCanAskYesNo: IntentsCanAskYesNo,
    strings: strings
}