const constants = require("../constants");
const strings = constants.strings;
const attributesSetter = require("../setAttributes");

function listItemsInObject(handlerInput, object){
    
    const inventory = handlerInput.attributesManager.getSessionAttributes().gamestate.inventory;
    
    var output = "";
    // check each element of the object
    Object.keys(object).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
    
    
        console.log("inventory: " + JSON.stringify(inventory));
        console.log ("item checked " + JSON.stringify(object[key]))
        
        // only process the item if it's not in the inventory
        if (!isInInventory(inventory,object[key].name)){
            output += object[key].undefinedString
        
            if (index === Object.keys(object).length - 2){
            	 output += " y "
            }
            
            else if (index === Object.keys(object).length - 1){
                output += ". "
            }
            
            else {
                output += ", "
            }
        }
    });
    
    console.log("output list items in object " + output)
    return output;
}


function getKeyItemsInInventory(inventory){
    let keyItems = new Array()
    
    // process each item in the inventory
    Object.keys(inventory).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
        
        // if it's a key item, add it to the keyItems array
        if (inventory[key].isKeyItem){
            keyItems.push(inventory[key])
        }
    });

    return keyItems;
}

function interactWithNormalItem(handlerInput,item){
    
    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const inventory = sessionAttributes.gamestate.inventory;
    
    // it is unlocked by default
    var isUnlocked = true;
    
    // if it can actually be locked, we have to check whether it is or not
    if (item.canBeLocked){
        
        console.log("busco " + item.name);
        
        if (sessionAttributes.gamestate.unlockedElements.find(element => element === item.name) === undefined){
            isUnlocked = false;
        }
    }
    
    // if the item is locked
    // there are 2 types of locked items: 
    // 1st type - those that can be unlocked with an item (i.e. with a screwdriver)
    // 2nd type - those that unlock via interaction with other thing (i.e pressing a button)
    if (!isUnlocked){
         speakOutput += item.lockedDesc;
         
         // "1st type" locked item (needs another item to be unlocked)
         if (item.neededItem !== undefined && item.neededItem !== null){
        
            // search the needed item in the inventory
            // if the player has it, ask them whether they want to use it
            if (isInInventory(inventory,item.neededItem)){
                
                var neededItem = inventory.find(element => element.name === item.neededItem)
                
                attributesSetter.setItem(handlerInput,neededItem);
                speakOutput += "¿Quieres usar " + neededItem.definedString +  "? "
                attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
            }
        }
        
        // we don't need to check anything for the 2nd type of locked item
    }
    
    // if the item is not locked
    else {
       // output item description
        speakOutput += item.desc;
        // output elements inside the item
        if (item.elements !== null && item.elements !== undefined){
            
            // list elements in the item
            var itemsInObjectOutput = listItemsInObject(handlerInput,item.elements);
            
            if (itemsInObjectOutput !== ""){
                speakOutput += " En " + item.definedString + " hay " + itemsInObjectOutput;
            }
            
        }
        
        // if it can be picked, ask the player if they want to save it.
        if (item.canBePicked === true){
                        
            // set item in sessionAttributes
            attributesSetter.setItem(handlerInput,item);
            speakOutput += "¿Quieres guardar " + item.definedString +  " en el inventario? "
            attributesSetter.setQuestion(handlerInput,'QuieresGuardarItem')
        }
        
        // if it can be used, ask the player if they want to use it
        else if (item.canBeUsed === true){
            
            var usedItems = sessionAttributes.gamestate.usedItems;
            
            var hasBeenUsedAlready = usedItems.find(element => element === item.name)
            
            // if the item hasn't been used
            // set item in sessionAttributes
            if (!hasBeenUsedAlready){
                attributesSetter.setItem(handlerInput,item);
                speakOutput += "¿Quieres usar ahora " + item.definedString +  "? "
                attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
            }
            
            else {
                 speakOutput += " Ya has usado " + item.definedString +  ". "
            }
            
        }
        
        // if the interaction hasn't produced anything, it's beacuse the item is empty.
        if (speakOutput === ""){
             speakOutput += " En " + item.definedString + " no hay nada interesante. ";
        }
    }
    return speakOutput;
}


function interactWithMotor(handlerInput,motor){
    var speakOutput = "";
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const inventory = sessionAttributes.gamestate.inventory;
    const motorState = sessionAttributes.gamestate.motorState;
    
    
    // output the desc of the engine depending on its state
    speakOutput += motor[motorState + "Desc"]
    
    // if the engine is not in its final state 
    // search if the player has the needed item (to get to the next state) in the inventory
    if(motor[motorState + "NeededItem"]){
        if (isInInventory(inventory,motor[motorState + "NeededItem"])){
                
            let neededItem = inventory.find(element => element.name === motor[motorState + "NeededItem"])
            
            attributesSetter.setItem(handlerInput,neededItem);
            speakOutput += "¿Quieres usar " + neededItem.definedString +  "? "
            attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
        }
    }
    
    // The engine is running (but needs extra fixes to get to 100%)
    else if (motorState !== "fixed"){
        // get the key items in the inventory
        var keyItemsInInventory = getKeyItemsInInventory(inventory)
        
        if (keyItemsInInventory.length === 0){
            speakOutput += strings.HINT_BROKEN_ENGINE_NO_KEY_ITEMS;
        }
        else if (keyItemsInInventory.length === 1 && motorState !== "semiFixed"){
            
            attributesSetter.setItem(handlerInput,keyItemsInInventory[0]);
            attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
            speakOutput += "En tu inventario tienes " + keyItemsInInventory[0].definedString + " ";
            
            if (keyItemsInInventory[0].name === "libro reparacion motores estelares"){
                speakOutput += " ¿Quieres leerlo? Te puede ayudar a entender cómo arreglar el motor.  "
            }
            else if (keyItemsInInventory[0].name === "hiperherramientas"){
                speakOutput += " ¿Quieres utilizarlas para intentar arreglar el motor? "
            }

        }
        else if (keyItemsInInventory.length === 2){
            
            let bothKeyItems = {"name": "bothKeyItems", "isKeyItem":true}
            attributesSetter.setItem(handlerInput,bothKeyItems);
            attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
            
            if(motorState === "semiFixed"){
                speakOutput += "Ahora tienes tanto " + keyItemsInInventory[0].definedString + " como " + keyItemsInInventory[1].definedString + ". ";
                speakOutput += "¿Quieres intentar arreglar el motor por completo? "
            }
            else {
                speakOutput += "En tu inventario tienes tanto " + keyItemsInInventory[0].definedString + " como " + keyItemsInInventory[1].definedString + ". ";
                speakOutput += "Si lees el libro podrás entender lo que le pasa al motor, y luego podrás arreglarlo con las herramientas. "
                speakOutput += "¿Quieres intentarlo? "
            }

            
        }
        
    }
    
    // else -> the engine is running at 100%
    
    return speakOutput;
}


function interactWithNavSystemOrButton(handlerInput,item){
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    const motorState = sessionAttributes.gamestate.motorState;
    
    var speakOutput = "";
    
    
    if (sessionAttributes.gamestate.unlockedElements.find(element => element === item.name) === undefined){
        speakOutput += item.lockedDesc;
    }
    else{
        speakOutput += item.desc;
        // output the desc depending on the engine state
        speakOutput += item[motorState + "MotorDesc"]
        
        if(item.name === "boton arranque"){
            attributesSetter.setItem(handlerInput,item);
            speakOutput += "¿Quieres pulsar " + item.definedString +  " e iniciar el viaje de vuelta al sistema solar?"
            attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
        }
                
    }
    
    
    return speakOutput;
}

function interactWithRadio(handlerInput,radio){
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var radioState = sessionAttributes.gamestate.button1TimesClicked;
    
    if (radioState > 3){
        radioState = 3;
    }
    else if(!radioState){
        radioState = 0;
    }
    
    var speakOutput = radio.desc;
    
    // output the desc depending on the engine state
    speakOutput += radio[radioState + "Desc"]
    
    return speakOutput;
}


function interactWithUnhibernationButton(handlerInput,button){
    
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    var speakOutput = "";
    
    var usedItems = sessionAttributes.gamestate.usedItems;
    var hasBeenUsedAlready = usedItems.find(element => element === button.name)
            
    if (!hasBeenUsedAlready){
        var valueClicked = sessionAttributes.gamestate.button3ValueOfClicks;

        if (valueClicked > 0 && valueClicked % 9 === 0){
            speakOutput += button.desc;
            attributesSetter.setItem(handlerInput,button);
            speakOutput += "¿Quieres pulsarlo? "
            attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
        }
        else {
            speakOutput += button.lockedDesc;
        }
    }
    else {
        speakOutput += button.desc;
        speakOutput += "Ya lo has pulsado antes. ";
    }
    
    return speakOutput;
}

function interactWithFirstDrawer(handlerInput,drawer){
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var drawerState = sessionAttributes.gamestate.button2TimesClicked;
    
    if (drawerState > 1){
        drawerState = 1;
    }
    else if(!drawerState){
        drawerState = 0;
    }
    
    var speakOutput = drawer.desc;
    
    // output the desc depending on the engine state
    speakOutput += drawer[drawerState + "Desc"]
    
    return speakOutput;
}

function interactWithHibernationCapsules(handlerInput,capsules){
    
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    var usedItems = sessionAttributes.gamestate.usedItems;
    var hasPressedUnhibernationButton = usedItems.find(element => element === "boton deshibernacion")
    
    var desc = "";
    if (hasPressedUnhibernationButton){
        desc = capsules.processStartedDesc;
        console.log("has pressed button: " +desc);
    }
    else {
        desc = capsules.desc;
        console.log("standard: " +desc);
    }
    

    
    return desc;
}


/*
    getItemInPlace function
    Looks for an item in the place object and returns it
    Can also return null if the item hasn't been found
*/
function getItemInPlace (place,itemName) {
    
    const elements = place.elements;
    
    // check each room in ROOMS Object
    const keys = Object.keys(elements);
    
    var itemFound = null;
    var i = 0;
    while (i < keys.length && itemFound === null){
        var key = keys[i]

        if (elements[key].name == itemName){
        	itemFound = elements[key];
        }
        else if (elements[key].hasOwnProperty('elements')){
            itemFound = getItemInPlace(elements[key], itemName)
        }
        i++;
    }
    return itemFound;
}


function itemInteraction(handlerInput, item){
    
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes()
    const currentRoom = sessionAttributes.gamestate.currentRoom;
    const inventory = sessionAttributes.gamestate.inventory;

    var speakOutput = "";
    
    
    // we can't get the items that the user has already picked (check their inventory)
    if (item !== null){
        if (isInInventory(inventory,item.name)){
            item = null;
        }
    }

    
    // if we can interact with the item
    if (item !== null){
        
        if (item.name === "motor"){
            speakOutput += interactWithMotor(handlerInput,item);
        }
        
        else if (item.name === "ordenador" || item.name === "boton arranque"){
            speakOutput += interactWithNavSystemOrButton(handlerInput,item);
        }
        
        else if (item.name === "boton deshibernacion"){
            speakOutput += interactWithUnhibernationButton(handlerInput,item);
        }
        
        else if (item.name === "radio"){
            speakOutput += interactWithRadio(handlerInput,item);
        }
        
        else if (item.name === "primer cajon"){
            speakOutput += interactWithFirstDrawer(handlerInput,item);
        }  
        
        else if (item.name === "capsulas regeneracion"){
            speakOutput += interactWithHibernationCapsules(handlerInput,item);
        }  
 
        else {
            speakOutput += interactWithNormalItem(handlerInput,item);
        }
        
    }
    else {
         speakOutput += "No he encontrado eso en la habitación. ";
    }
    
    return speakOutput;
}


/*
    searchRoom function
    Looks for a room in the ROOMS Object and returns it
    Can also return null if the room hasn't been found
*/
function searchRoom (handlerInput, roomName) {
    
    console.log("Searching for room " + roomName);
    
    const ROOMS =  handlerInput.attributesManager.getSessionAttributes().ROOMS;
    var roomSearched = null;
    
    // check each room in ROOMS Object
    Object.keys(ROOMS).forEach(function(key,index) {
        // key: the name of the object key
        // index: the ordinal position of the key within the object 
    
        if (ROOMS[key].name == roomName){
        	roomSearched = ROOMS[key]
        }
    });
    
    console.log("roomFound " + JSON.stringify(roomSearched));
    
    return roomSearched;
}

function isInInventory (inventory, objectName){
    console.log("tis in inventory")
    if (inventory.find(element => element.name === objectName) === undefined) return false;
    else return true;
}

/*
    isThereADoorToGoToRoom function
    Checks whether the player can access a room or not, based on the doors in the current room
*/
function isThereADoorToGoToRoom (handlerInput, room){
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // get the doors in the currentRoom
    const currentRoomDoors = sessionAttributes.gamestate.currentRoom.elements.doors
        
    var canGo = false;
    
    // check if there is a door to go to the room
    if (Object.keys(currentRoomDoors).find(key => (currentRoomDoors[key].roomName === room.name))){
        canGo = true;
    }
    
    return canGo;
}

function doorIsOpen (handlerInput, roomName){
     const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    // get the blocked rooms
    const blockedRooms = sessionAttributes.gamestate.blockedRooms;
    
    var doorUnlocked = false;
    
    // check if the room is locked
    if (!blockedRooms.find(e => (e === roomName))){
        doorUnlocked = true;
    }
    
    return doorUnlocked;
}

/*
    getDoorInPlace function
    Looks for a door in the ROOMS Object and returns it
    Can also return null if the door hasn't been found
*/
function getDoorInPlace (place,itemName) {
    
    const doors = place.elements.doors;
    
    // check each room in ROOMS Object
    const keys = Object.keys(doors);
    
    var doorFound = null;
    var i = 0;
    while (i < keys.length && doorFound === null){
        var key = keys[i]

        if (doors[key].name == itemName){
        	doorFound = doors[key];
        }
        
        i++;
    }
    return doorFound;
}


function doorInteraction(handlerInput,door){
    
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes()

    
    var speakOutput = "";
    
    
    if (door != null){
        speakOutput += "Es la puerta que lleva " + door.string + ". ";
        
        // it is reachable by default
        var isReachable = true;
        
        // if it can be unreachable, we have to check if it is locked or not
        if(door.canBeLocked){
            if (sessionAttributes.gamestate.unlockedElements.find(element => element === door.name) === undefined){
                isReachable = false;
            }
        }
        
        // if the door is unreachable, say so
        // and check if the user has the item to reach it
        if (!isReachable){
             speakOutput += door.lockedDesc;
             const inventory = sessionAttributes.gamestate.inventory;
            // search the needed item in the inventory
            // if the player has it, ask them whether they want to use it
            if (isInInventory(inventory,door.neededItem)){
                
                var neededItem = inventory.find(element => element.name === door.neededItem)
                
                attributesSetter.setItem(handlerInput,neededItem);
                speakOutput += "¿Quieres usar " + neededItem.definedString +  "? "
                attributesSetter.setQuestion(handlerInput,'QuieresUsarItem')
            }
        }
        
        // if the door is reachable, we can now check if its open
        else {
            if (doorIsOpen(handlerInput,door.roomName)){
                speakOutput += "Está abierta. ";
            }
        
            else {
                
                if (door.opensWithCode){
                    speakOutput += "Es necesario introducir un código para desbloquearla. ";
                    speakOutput += door.desc;
                    
                    if (isReachable){
                        speakOutput += "¿Quieres introducir el código para abrir la puerta? ";
                        attributesSetter.setDoor(handlerInput, door);
                        attributesSetter.setQuestion(handlerInput, "QuieresAbrirLaPuertaConCodigo");
                    }
                    
                }
                
                else if (door.opensWithItem){
                    speakOutput += door.desc;
                    
                    if (isReachable){
                        const inventory = sessionAttributes.gamestate.inventory;
                        
                        console.log("inventory " + JSON.stringify(inventory));
                        console.log (door.requiredItem)
                        if (isInInventory(inventory, door.requiredItem)){
                            speakOutput += "¿Quieres usar " + door.requiredItemString + " para abrir la puerta? ";
                            
                            attributesSetter.setDoor(handlerInput, door);
                            
                            attributesSetter.setQuestion(handlerInput, "QuieresAbrirLaPuertaConItem");
                        }
                    }
    
                }
                
            }
        }
             

    }
    else {
        speakOutput += "No he encontrado esa puerta. ";
    }
    return speakOutput;
}

function useRegularItem (handlerInput, item){
    
    var sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
    var currentRoom = sessionAttributes.gamestate.currentRoom;
    var speakOutput = "";
    
    // the batteries have some different uses
    if (item.name === "baterias"){
        
        var poweredRooms = sessionAttributes.gamestate.poweredRooms;
        poweredRooms.push(currentRoom.name)
        sessionAttributes.gamestate.poweredRooms = poweredRooms;
        
        let unlockedElements = sessionAttributes.gamestate.unlockedElements;
        
        if (currentRoom.name === "sala 2"){
            unlockedElements.push("ranuras");
            
            speakOutput += "Has introducido las baterias. Ahora puedes ver toda la habitación. "
            speakOutput += "Es un dormitorio individual, algo poco común en este tipo de naves."
        }
        
        else if (currentRoom.name === "sala 3"){
            unlockedElements.push("pantallas");
            unlockedElements.push("escaner medico");
            
            speakOutput += "Gracias a las baterías, se ha activado la fuente de alimentación. "
            speakOutput += "Se han encendido las pantallas y se ha abierto el escáner médico. "
        }
        
        sessionAttributes.gamestate.unlockedElements = unlockedElements;
        sessionAttributes.hasChangedGamestate = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
    
    // if it is one of the engine-related items
    // (but not key items)
    else if (item.isEngineRelated){
        
         // output different strings depending on the item used
        if (item.name === "cables"){
            speakOutput += "Has conectado los cables a la batería del motor. "
            speakOutput += "Al intentar arrancarlo, ha emitido sonidos extraños. Quizás le falte algo más. "
        }
        
        else if (item.name === "agua magnetica"){
            speakOutput += "Has vertido el agua magnética en el depósito indicado. "
            speakOutput += "El motor se ha arrancado, pero inmediatamente se ha apagado. Parece que necesita combustible. "
        }
        
        else if (item.name === "combustible"){
            
            let unlockedElements = sessionAttributes.gamestate.unlockedElements;
            unlockedElements.push("ordenador");
            unlockedElements.push("boton arranque");
            sessionAttributes.gamestate.unlockedElements = unlockedElements;
            
            speakOutput += "Has introducido la piedra de combustible en la ranura para ello. "
            speakOutput += "<audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_engines_on_02\"/>"
            speakOutput += "¡Bien! Se ha arrancado. "
            speakOutput += "También se ha encendido el ordenador que controla el sistema de navegación. "
        }
        
        // set next motorState
        sessionAttributes.gamestate.motorState = item.nextState;
        sessionAttributes.hasChangedGamestate = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
    }
    
    else if (item.name === "boton arranque"){
        speakOutput += strings.TAKEOFF_SOUND + " ";
        
        if (sessionAttributes.gamestate.motorState === "fixed"){
            speakOutput += strings.ENDGAME_GOOD
        }
        else if (sessionAttributes.gamestate.motorState === "semiFixed"){
            speakOutput += strings.ENDGAME_MEDIUM
        }
        else speakOutput += strings.ENDGAME_BAD
    }
    
    else if (item.name === "boton deshibernacion"){
        speakOutput += strings.DESHIBERNATION_PROCCESS_STARTED
    }
    
    // if the item is neither the batteries nor the engine related items nor the buttons
    else {
    
        // set element as unlocked
        let unlockedElements = sessionAttributes.gamestate.unlockedElements;
        unlockedElements.push(item.unlocks);
        sessionAttributes.gamestate.unlockedElements = unlockedElements;
        sessionAttributes.hasChangedGamestate = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        // output different strings depending on the item used
        if (item.name === "destornillador"){
            speakOutput += "Has quitado los tornillos y has retirado la tapa del conducto. "
            speakOutput += "Se escucha un sonido repetitivo. Creo que es un mensaje en código morse. "
        }
        else if (item.name === "boton"){
            speakOutput += "Has presionado el botón. "
            speakOutput += "<audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_01\"/>"
            speakOutput += " Parece que se ha desbloqueado algo. "
        }
        else if (item.name === "mando"){
            speakOutput += "Has pulsado los botones del mando."
            speakOutput += "<audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_01\"/>"
            speakOutput += " Parece que se ha desbloqueado algo. "
        }
        
        else if (item.name === "mando"){
            speakOutput += "Has pulsado los botones del mando."
            speakOutput += "<audio src=\"soundbank://soundlibrary/scifi/amzn_sfx_scifi_door_open_01\"/>"
            speakOutput += " Parece que se ha desbloqueado algo. "
        }
        
        else if (item.name === "escalera hiperplegable"){
            speakOutput += "Has desbloqueado la escalera y la has colocado."
            speakOutput += " Ahora puedes llegar a la escotilla. "
        }
    }

    
    if (item.canBeUsed){
        let usedItems = sessionAttributes.gamestate.usedItems;
        usedItems.push(item.name);
        
        sessionAttributes.gamestate.usedItems = usedItems;
        sessionAttributes.hasChangedGamestate = true;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    }
    
    return speakOutput;
}


function useKeyItem (handlerInput, item){
    
    var sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
    var currentRoom = sessionAttributes.gamestate.currentRoom;
    var speakOutput = "";
    var nextMotorState;
    
    if (item.name === "bothKeyItems"){
        speakOutput += "Gracias al libro y las hiperherramientas has conseguido encontrar y corregir todos los fallos que tenía el motor.  "
        speakOutput += "¡Ahora funciona al cien por cien! "
        nextMotorState = "fixed";
    }
    else {
       if (item.name === "hiperherramientas"){
            speakOutput += "Aunque no sabes exactamente que le pasa al motor, has utilizado las hiperherramientas. "
            speakOutput += "¡Bien! " 
            speakOutput += "El sistema de navegación ahora indica que el motor está al sesenta por ciento. "
        }
        else if (item.name === "libro reparacion motores estelares"){
            speakOutput += "Gracias al libro, ahora sabes qué le pasa al motor. Has corregido algunos fallos, pero necesitas herramientas más avanzadas si quieres arreglarlo por completo. "
            speakOutput += "El sistema de navegación ahora indica que el motor está al sesenta por ciento. "
        }
        
        nextMotorState = "semiFixed";
    }
    

    // update motorState
    sessionAttributes.gamestate.motorState = nextMotorState;
    sessionAttributes.hasChangedGamestate = true;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    
    return speakOutput;
}





module.exports = { 
    listItemsInObject: listItemsInObject,
    getKeyItemsInInventory: getKeyItemsInInventory,
    interactWithNormalItem: interactWithNormalItem,
    interactWithMotor: interactWithMotor,
    interactWithNavSystemOrButton: interactWithNavSystemOrButton,
    interactWithUnhibernationButton: interactWithUnhibernationButton,
    getItemInPlace: getItemInPlace,
    itemInteraction: itemInteraction,
    searchRoom: searchRoom,
    isInInventory: isInInventory,
    isThereADoorToGoToRoom: isThereADoorToGoToRoom,
    doorIsOpen: doorIsOpen,
    getDoorInPlace: getDoorInPlace,
    doorInteraction: doorInteraction,
    useRegularItem: useRegularItem,
    useKeyItem: useKeyItem
}