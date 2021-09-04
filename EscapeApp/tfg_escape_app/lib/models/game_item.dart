// GameItem class
class GameItem {
  final String name ;
  final String desc ;
  final String img;


  GameItem(this.name, this.desc, this.img);

  GameItem.fromJson(Map<String, dynamic> json)
      : name = json['formattedName'],
        img = json['img'],
        desc = json['desc'];

  Map<String, dynamic> toJson() => {
    'name': name,
    'desc': desc,
    'imgUrl':img
  };

  @override
  String toString() {
    return "${name} : ${desc}. Img: ${img} ";
  }
}