import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:tfg_escape_app/models/api_response.dart';
import 'package:http/http.dart' as http;
import 'package:tfg_escape_app/models/game_state.dart';
import 'package:tfg_escape_app/models/room.dart';


Future<ApiResponse> makePostRequestScanQR(String qrID, GameState gamestate) async {
  print(qrID);
  ApiResponse _apiResponse = new ApiResponse();


  var entriesUnlocked = List<String>.from(gamestate.diaryEntriesUnlocked);
  
  var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/scan-diary');

  final entry = entriesUnlocked.firstWhere((element) =>
                element == qrID,
                    orElse: () {
                      return "";
                    });


  print("entry: " + entry);
  if (entry == ""){

    if (qrID == "e1,e2,e3" || qrID == "e4,e5,e6" || qrID == "e1" ||  qrID == "e2" || qrID == "e3" || qrID == "e4" ||qrID == "e5" || qrID == "e6"){
      entriesUnlocked.add(qrID);
    }

  }

  print("entriesUnlocked: " +entriesUnlocked.toString());
  print("gamestate.diaryEntriesUnlocked: " +gamestate.diaryEntriesUnlocked.toString());

  if(entriesUnlocked !=  gamestate.diaryEntriesUnlocked){
    try {
      final response = await await http.post(url, body: {'diaryEntriesUnlocked': entriesUnlocked.toString(), 'GameID':gamestate.userID});

      print('Response status: ${response.statusCode}');
      print('Response body: ${response.body}');

      switch (response.statusCode) {
        case 200:
          _apiResponse.data = response.body;
          break;
        case 500:
          _apiResponse.apiError = json.decode(response.body);
          break;
        default:
          _apiResponse.apiError = json.decode(response.body);
          break;
      }
    } on SocketException {
      _apiResponse.apiError = "Server error. Please retry";
      _apiResponse.error = "Server error. Please retry";
    }
  }
  return _apiResponse;
}

Future<ApiResponse> connectUser(String userID) async {
  print(userID);
  ApiResponse _apiResponse = new ApiResponse();

  var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/login-user/' + userID);
  try {
    final response =  await http.get(url);

    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');

    switch (response.statusCode) {
      case 200:
        _apiResponse.data = response.body;
        break;
      case 501:
        _apiResponse.data = Null;
        _apiResponse.apiError = response.body;
        break;
      default:
        _apiResponse.data = Null;
        _apiResponse.apiError = json.decode(response.body);
        break;
    }
  } on SocketException {
    _apiResponse.apiError = "Server error. Please retry";
    _apiResponse.error = "Server error. Please retry";
  }
  return _apiResponse;
}

Future<GameState> getGamestate(String userID) async {
  print(userID);
  GameState gameState = GameState.emptyState();

  var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/get-gamestate/' + userID);
  try {
    final response =  await http.get(url);

    switch (response.statusCode) {
      case 200:
        gameState = GameState.fromJson(json.decode(response.body));
        break;
      default:
        break;
    }
  } on SocketException {}

  return gameState;
}

Future<Map> getRooms() async {
  Map<String,Room> rooms = new Map();

  var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/get-game-rooms');
  try {
    final response =  await http.get(url);

    switch (response.statusCode) {
      case 200:
         for (var item in json.decode(response.body)){
          rooms[item['name']] = (Room.fromJson(item));
          print("creo room");
        }
        break;
      default:
        break;
    }
  } on SocketException {}

  return rooms;
}
