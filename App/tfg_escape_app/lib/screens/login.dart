
import 'package:flutter/material.dart';
import 'package:tfg_escape_app/models/game_state.dart';
import 'package:tfg_escape_app/service/api.dart';
import 'package:shared_preferences/shared_preferences.dart';

class Login extends StatelessWidget {

  // Note: This is a GlobalKey<FormState>,
  // not a GlobalKey<MyCustomFormState>.
  final _formKey = GlobalKey<FormState>();

  String _userID = "";
  var _apiResponse;

  void _handleSubmitted(BuildContext context) async {
      // Validate returns true if the form is valid, or false otherwise.
      var f = _formKey.currentState;
      print(_formKey);
      if (f != null) {
        if (f.validate()) {

          f.save();
           _apiResponse = await connectUser(_userID);
          // If the form is valid, display a snackbar. In the real world,
          // you'd often call a server or save the information in a database.

          if (_apiResponse.data != Null){
            _saveAndRedirectToHome(context);

          }
          else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Fallo en el login')),
            );
          }

        }
      }

  }
  void _saveAndRedirectToHome(BuildContext context) async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    await prefs.setString("userId", (_userID));
    Navigator.pushNamedAndRemoveUntil(
        context, '/home', ModalRoute.withName('/home'),
        arguments: (_userID));
  }

  @override
  Widget build(BuildContext context) {
    Size size = MediaQuery.of(context).size;

    return Scaffold(
      body: Container(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              alignment: Alignment.centerLeft,
              padding: EdgeInsets.symmetric(horizontal: 40),
              child: Text(
                "Introduce tu ID de usuario",
                style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.blue,
                    fontSize: 36
                ),
                textAlign: TextAlign.left,
              ),
            ),

            SizedBox(height: size.height * 0.03),

            Container(
              alignment: Alignment.center,
              margin: EdgeInsets.symmetric(horizontal: 40),
              child: Form(
                key: _formKey,
                child: TextFormField(
                  decoration: InputDecoration(labelText: "ID de usuario"),
                  keyboardType: TextInputType.text,
                  onSaved: (String? value) {
                    if (value != null){
                      _userID = value;
                    }
                    print(_userID);
                  },
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Introduce el ID de usuario';
                    }
                      return null;
                    },
                ),
              )
            ),




            Container(
              alignment: Alignment.center,
              margin: EdgeInsets.symmetric(horizontal: 40, vertical: 100),
              child: ElevatedButton(
                  onPressed: () {
                    _handleSubmitted(context);
                  },
                child: const Text('Login'),
                style: ElevatedButton.styleFrom(
                  primary: Colors.blue,
                  onPrimary: Colors.white,
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(30))),
                    padding: EdgeInsets.only(
                        left: 60,
                        right: 60,
                        top: 15,
                        bottom: 15
                    ),
                  textStyle: TextStyle(
                      color: Colors.black,
                      fontSize: 28,
                    fontWeight: FontWeight.bold
                  ),
                ),
                //shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(80.0)),
                //textColor: Colors.white,
                //padding: const EdgeInsets.all(0),
                /*
                child: Container(
                  alignment: Alignment.center,
                  height: 50.0,
                  width: size.width * 0.5,
                  decoration: new BoxDecoration(
                      borderRadius: BorderRadius.circular(80.0),
                      gradient: new LinearGradient(
                          colors: [
                            Color.fromARGB(255, 31, 31, 255),
                            Color.fromARGB(255, 120, 121, 255)
                          ]
                      )
                  ),
                  padding: const EdgeInsets.all(0),
                  child: Text(
                    "LOGIN",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                        fontWeight: FontWeight.bold
                    ),
                  ),
                ),*/
              ),
            ),
          ],
        ),
      ),
    );
  }
}


/*
class Login extends StatefulWidget {
  @override
  _LoginState createState() => _LoginState();
}

Widget build(BuildContext context) {

  var _scaffoldKey;
  var _formKey;

  return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        title: Text('Login'),
      ),
      body: SafeArea(
        top: false,
        bottom: false,
        child: Form(
          autovalidate: true,
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      TextFormField(
                        key: Key("_username"),
                        decoration: InputDecoration(labelText: "Username"),
                        keyboardType: TextInputType.text,
                        validator: (value) {
                          if (value == null) {
                            return 'Username is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 10.0),
                      ButtonBar(
                        children: <Widget>[
                          ElevatedButton.icon(onPressed: _handleSubmitted, icon: Icon(Icons.arrow_forward), label: Text('Sign in'))
                        ],
                      ),
                    ],
                  ),
                ]),
          ),
        ),
      ));
}

void _handleSubmitted() async {
  final FormState form = _formKey.currentState;
  if (!form.validate()) {
    final snackBar = SnackBar(
      content: const Text('Yay! A SnackBar!'),
      action: SnackBarAction(
        label: 'Undo',
        onPressed: () {
          // Some code to undo the change.
        },
      ),
    );

    // Find the ScaffoldMessenger in the widget tree
    // and use it to show a SnackBar.
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  } else {
    form.save();
    _apiResponse = await authenticateUser(_username, _password);
    if ((_apiResponse.ApiError as ApiError) == null) {
      _saveAndRedirectToHome();
    } else {
      showInSnackBar((_apiResponse.ApiError as ApiError).error);
    }
  }
}
*/
