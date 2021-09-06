// Gamestate class

import 'package:flutter/material.dart';

import 'game_item.dart';

class GameState {

  String _userID = "";
  String _currentRoomName = '';
  List <String> _diaryEntriesUnlocked = [];
  List<GameItem> _inventory = [];
  List <String> _poweredRooms = [];

  // constructor
  GameState(this._userID, this._currentRoomName, this._inventory, this._diaryEntriesUnlocked, this
  ._poweredRooms);

  GameState.emptyState();

  // getters
  String get currentRoomName => _currentRoomName;
  String get userID => _userID;
  List<GameItem> get inventory => _inventory;
  List<String> get diaryEntriesUnlocked => _diaryEntriesUnlocked;
  List<String> get poweredRooms => _poweredRooms; // setters

  set userID(String value) {
    _userID = value;
  }
  set currentRoomName(String value) {
    _currentRoomName = value;
  }
  set inventory(List<GameItem> value) {
    _inventory = value;
  }
  set diaryEntriesUnlocked(List<String> value) {
    _diaryEntriesUnlocked = value;
  }

  set poweredRooms(List<String> value) {
    _poweredRooms = value;
  }

  // create the user object from json input
  GameState.fromJson(Map<String, dynamic> json) {
    _currentRoomName = json['currentRoomName'];
     userID = json['GameID'] ;

     if(json ['diaryEntriesUnlocked'] != null){
       diaryEntriesUnlocked = new List<String>.from(json ['diaryEntriesUnlocked']);
     }

     if(json['poweredRooms'] != null){
       poweredRooms = new List<String>.from(json ['poweredRooms']);

       print("poweredRooms " + poweredRooms.toString());
     }

    for (var item in json['inventory']){
      _inventory.add(GameItem.fromJson(item));
    }

  }

  // export to json
  /*
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userID'] = this._userID;
    data['currentRoomName'] = this._currentRoomName;
    data['inventory'] = this._inventory;
    return data;
  }*/
}