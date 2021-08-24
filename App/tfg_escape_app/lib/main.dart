
import 'package:flutter/material.dart';
import 'package:tfg_escape_app/screens/home.dart';
import 'package:tfg_escape_app/screens/login.dart';
import 'landing.dart';


void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Escape App',
      routes: {
        '/': (context) => Landing(),
        '/login': (context) => Login(),
        '/home': (context) => MyHomePage(),
      }
    );
  }
}









