import 'package:flutter/material.dart';
import 'package:tfg_escape_app/models/diary_entry.dart';

class SingleEntry extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final DiaryEntry entry = ModalRoute.of(context)!.settings.arguments as DiaryEntry;
    print(entry);

    return Scaffold(
      appBar: AppBar(
        title: Text("Entrada del diario"),
      ),
      body: Container(
          alignment: Alignment.center,
          child: Column (
            children: [
              Container(
                  padding: const EdgeInsets.all(8),
                  child: Container(
                      padding: EdgeInsets.fromLTRB(20, 20, 20, 20),
                      child:
                      Text(
                        entry.title(),
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                            fontSize: 18
                        ),
                      )
                  )
              ),
              Expanded(
                  child: Container(
                    padding: EdgeInsets.fromLTRB(20, 0, 20, 20),
                    child: Text(
                        entry.desc,
                      style: TextStyle(
                          fontSize: 18
                      ),
                    ),
                  )
              )
            ],
          )
      )
    );
  }
}