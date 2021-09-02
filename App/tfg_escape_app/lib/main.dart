
import 'package:flutter/material.dart';
import 'package:tfg_escape_app/screens/home.dart';
import 'package:tfg_escape_app/screens/item_screen.dart';
import 'package:tfg_escape_app/screens/login.dart';
import 'package:tfg_escape_app/screens/single_entry.dart';
import 'landing.dart';


void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      // hide the debug banner
      debugShowCheckedModeBanner: false,
      title: 'Escape App',
      routes: {
        '/': (context) => Landing(),
        '/login': (context) => Login(),
        '/home': (context) => MyHomePage(),
        "/single-entry": (context) => SingleEntry(),
        "/item-screen": (context) => ItemScreen()
      }
    );
  }
}









