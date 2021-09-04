const constants = require("../constants") 
const strings = constants.strings;

function CanAskYesNo (intentName) {
    return constants.IntentsCanAskYesNo.includes(intentName)
}


module.exports = { 
    CanAskYesNo: CanAskYesNo
}