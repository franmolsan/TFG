import 'package:flutter/material.dart';
import 'package:tfg_escape_app/models/game_item.dart';

class ItemScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final item  = ModalRoute.of(context)!.settings.arguments as GameItem;
    print(item);

    return Scaffold(
        appBar: AppBar(
          title: Text(item.name),
        ),
        body: Container(
            alignment: Alignment.center,
            child: Column (
              children: [
                Container(
                    padding: const EdgeInsets.all(20),
                  child:  Image(
                    image: NetworkImage(item.img),
                  )
                ),
                Container(
                    child: Container(
                        padding: EdgeInsets.fromLTRB(20, 20, 20, 20),
                        child:
                        Text(
                          item.desc,
                          style: TextStyle(
                              color: Colors.black,
                              fontSize: 18
                          ),
                        )
                    )
                )
              ],
            )
        )
    );
  }
}