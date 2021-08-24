import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:tfg_escape_app/models/api_response.dart';
import 'package:http/http.dart' as http;
import 'package:tfg_escape_app/models/game_state.dart';


Future<ApiResponse> makePostRequestScanQR(String qrID) async {
  print(qrID);
  ApiResponse _apiResponse = new ApiResponse();

  var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/qr-read');

  try {
    final response = await await http.post(url, body: {'qrID': qrID});

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
