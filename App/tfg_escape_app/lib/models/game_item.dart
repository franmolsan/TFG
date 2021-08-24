// game_item class
class GameItem {
  final String name ;
  final String desc ;


  GameItem(this.name, this.desc);

  GameItem.fromJson(Map<String, dynamic> json)
      : name = json['formattedName'],
        desc = json['desc'];

  Map<String, dynamic> toJson() => {
    'name': name,
    'desc': desc,
  };

  @override
  String toString() {
    return "${name} : ${desc} ";
  }
}