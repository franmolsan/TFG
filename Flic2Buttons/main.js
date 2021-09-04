var buttonManager = require("buttons");
var http = require("http");
const host = "http://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev";
const GameID = "oOIvL"

function makeHTTPRequestRegularButton (ingameID){
	// make http POST Request
	// to "/register-button-clicked" endpoint

	var url = host + "/register-button-clicked"

	http.makeRequest({
		url: url,
		method: "POST",
		headers: {"Content-Type": "application/json"},
		content: JSON.stringify({"ingameID": ingameID, "GameID": GameID}),		
	}, function(err, res) {
		console.log()
		console.log("request status: " + res.statusCode);
	});
}

function makeHTTPRequestSequenceButton (ingameID,value){
	
	// make http POST Request
	// to "/register-sequence-button-clicked" endpoint
	var url = host + "/register-sequence-button-clicked"

	http.makeRequest({
		url: url,
		method: "POST",
		headers: {"Content-Type": "application/json"},
		content: JSON.stringify({"ingameID": ingameID, "GameID": GameID, "value":value}),		
	}, function(err, res) {
		console.log("request status: " + res.statusCode);
	});
}

// whenever a button is clicked (any type)
buttonManager.on("buttonSingleOrDoubleClickOrHold", function(obj) {
	
	// get the button and click type
	var button = buttonManager.getButton(obj.bdaddr);
	var clickType = obj.isSingleClick ? "click" : obj.isDoubleClick ? "double_click" : "hold";

	
	// if it is the button2, only make the request when the user makes a double click
	if (button.name === "button2"){
		if(clickType === "double_click"){
			makeHTTPRequestRegularButton(button.name)
		}
	}
	
	// if it is the button 3
	else if(button.name === "button3"){
		
		// calculate value depending on click type
		var clickValue = 0;
		
		if (clickType === "click") clickValue = 1; 
		else if (clickType === "double_click") clickValue = 2; 
		else if (clickType === "hold") clickValue = 3; 
		
		makeHTTPRequestSequenceButton(button.name,clickValue)
	}
	
	// if it is button 1
	else{
		makeHTTPRequestRegularButton(button.name)
	}
	
});

console.log("Started");