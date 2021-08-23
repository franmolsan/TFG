// Gamestate class
class GameState {

  String _userID = '';

  String _currentRoomName = '';
  late List<Map> _inventory;

  // constructor
  GameState(this._userID, this._currentRoomName, this._inventory);

  // getters
  String get currentRoomName => _currentRoomName;
  String get userID => _userID;
  List<Map> get inventory => _inventory;


  // setter
  set userID(String value) {
    _userID = value;
  }
  set currentRoomName(String value) {
    _currentRoomName = value;
  }
  set inventory(List<Map> value) {
    _inventory = value;
  }

  // create the user object from json input
  GameState.fromJson(Map<String, dynamic> json) {
    _currentRoomName = json['currentRoomName'];
    _userID = json['userID'];
    _inventory = json['inventory'];
  }

  // export to json
  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['userID'] = this._userID;
    data['currentRoomName'] = this._currentRoomName;
    data['inventory'] = this._inventory;
    return data;
  }
}