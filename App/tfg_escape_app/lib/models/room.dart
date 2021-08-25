
// Room Class
import 'game_item.dart';

class Room {

  String _name = "";

  String _formattedName = '';
  List<GameItem> _elements = [];
  List<GameItem> _doors = [];

  // constructor
  Room(this._name, this._formattedName, this._elements, this._doors);

  Room.emptyRoom();

  // getters
  String get name => _name;
  String get formattedName => _formattedName;
  List<GameItem> get elements => _elements;
  List<GameItem> get doors => _doors;

  // setters
  set name(String value) {
    _name = value;
  }
  set formattedName(String value) {
    _formattedName = value;
  }
  set elements(List<GameItem> value) {
    _elements = value;
  }
  set doors(List<GameItem> value) {
    _doors = value;
  }

  // create the user object from json input
  Room.fromJson(Map<String, dynamic> json) {
    _name = json['name'];
    _formattedName = json['formattedName'] ;
    Map<String, dynamic> doors = Map<String, dynamic>.from(json['elements']['doors']);
    doors.forEach((key, value) {
      _doors.add(GameItem.fromJson(value));
    });


    Map<String, dynamic> elements = Map<String, dynamic>.from(json['elements']);
    elements.forEach((key, value) {
      if (key != "doors"){
      _elements.add(GameItem.fromJson(value));
    }});
  }

  @override
  String toString() {
    return "${_formattedName}---------\n ${_elements}\n";
  }


}