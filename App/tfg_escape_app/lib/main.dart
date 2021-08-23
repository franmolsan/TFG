import 'dart:async';

import 'package:bottom_navy_bar/bottom_navy_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:url_launcher/link.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;




void main() => runApp(MyApp());

/*
class MyApp extends StatefulWidget {
  @override
  _QRPageState createState() => _QRPageState();
}

class _QRPageState extends State<MyApp> {
  String _scanBarcode = '';
  int _currentIndex = 0;
  PageController _pageController = PageController();


  final _pageOptions = [
    QRScreen()
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> startBarcodeScanStream() async {
    FlutterBarcodeScanner.getBarcodeStreamReceiver(
        '#ff6666', 'Cancel', true, ScanMode.BARCODE)!
        .listen((barcode) => print(barcode));
  }

  Future<void> scanQR() async {
    String barcodeScanRes;
    // Platform messages may fail, so we use a try/catch PlatformException.
    try {
      barcodeScanRes = await FlutterBarcodeScanner.scanBarcode(
          '#ff6666', 'Cancel', true, ScanMode.QR);
      print(barcodeScanRes);
    } on PlatformException {
      barcodeScanRes = 'Failed to get platform version.';
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {
      _scanBarcode = barcodeScanRes;
    });
  }


  Future<void> _launchURLBrowser(String qrID) async {
      var url = 'http://192.168.1.127:3000/qr-read/' + qrID;
      if (await canLaunch(url)) {
        await launch(url);
      } else {
        throw 'Could not launch $url';
      }
    }

  Future<void> _makePostRequest(String qrID) async {
    print(qrID);
    var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/qr-read');
    var response = await http.post(url, body: {'qrID': qrID});
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');
  }



  @override
  Widget build(BuildContext context) {
    return Scaffold(
            appBar: AppBar(title: const Text('Barcode scan')),
            body: Builder(builder: (BuildContext context) {
              return Container(
                  alignment: Alignment.center,
                  child: Flex(
                      direction: Axis.vertical,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        ElevatedButton(
                            onPressed: () => scanQR(),
                            child: Text('Start QR scan')),
                        if(_scanBarcode.isNotEmpty) ElevatedButton(
                            onPressed: () => _makePostRequest(_scanBarcode),
                            child: Text('GO')),
                        Text('Scan result : $_scanBarcode\n',
                            style: TextStyle(fontSize: 20))
                      ]),
              bottomNavigationBar: BottomNavyBar(
                  selectedIndex: _currentIndex,
                  showElevation: true, // use this to remove appBar's elevation
                  onItemSelected: (index) => setState(() {
                  _currentIndex = index;
                  _pageController.animateToPage(index,
                  duration: Duration(milliseconds: 300), curve: Curves.ease);
                }),
                items: [
                  BottomNavyBarItem(
                  icon: Icon(Icons.apps),
                  title: Text('Home'),
                  activeColor: Colors.red,
                  ),
                  BottomNavyBarItem(
                  icon: Icon(Icons.people),
                  title: Text('Users'),
                  activeColor: Colors.purpleAccent
                  ),
                  BottomNavyBarItem(
                  icon: Icon(Icons.message),
                  title: Text('Messages'),
                  activeColor: Colors.pink
                  ),
                  BottomNavyBarItem(
                  icon: Icon(Icons.settings),
                  title: Text('Settings'),
                  activeColor: Colors.blue
                  ),
                ],
              );
            }));
  }


}

class QRScreen {

}
*/

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Escape App',
      home: MyHomePage(),
    );
  }
}

class MyHomePage extends StatefulWidget {

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _scanBarcode = '';
  int _currentIndex = 0;
  PageController _pageController = PageController();

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> startBarcodeScanStream() async {
    FlutterBarcodeScanner.getBarcodeStreamReceiver(
        '#ff6666', 'Cancel', true, ScanMode.BARCODE)!
        .listen((barcode) => print(barcode));
  }

  Future<void> scanQR() async {
    String barcodeScanRes;
    // Platform messages may fail, so we use a try/catch PlatformException.
    try {
      barcodeScanRes = await FlutterBarcodeScanner.scanBarcode(
          '#ff6666', 'Cancel', true, ScanMode.QR);
      print(barcodeScanRes);
    } on PlatformException {
      barcodeScanRes = 'Failed to get platform version.';
    }

    // If the widget was removed from the tree while the asynchronous platform
    // message was in flight, we want to discard the reply rather than calling
    // setState to update our non-existent appearance.
    if (!mounted) return;

    setState(() {
      _scanBarcode = barcodeScanRes;
    });
  }


  Future<void> _launchURLBrowser(String qrID) async {
    var url = 'http://192.168.1.127:3000/qr-read/' + qrID;
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  Future<void> _makePostRequest(String qrID) async {
    print(qrID);
    var url = Uri.parse('https://e5bg757f0e.execute-api.eu-west-1.amazonaws.com/dev/qr-read');
    var response = await http.post(url, body: {'qrID': qrID});
    print('Response status: ${response.statusCode}');
    print('Response body: ${response.body}');
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Escape App")),
      body: SizedBox.expand(
        child: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            setState(() => _currentIndex = index);
          },
          children: <Widget>[
            Container(
                alignment: Alignment.center,
                child: Flex(
                    direction: Axis.vertical,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      ElevatedButton(
                          onPressed: () => scanQR(),
                          child: Text('Start QR scan')),
                      if(_scanBarcode.isNotEmpty) ElevatedButton(
                          onPressed: () => _makePostRequest(_scanBarcode),
                          child: Text('GO')),
                      Text('Scan result : $_scanBarcode\n',
                          style: TextStyle(fontSize: 20))]
                )),
            Container(color: Colors.red,),
            Container(color: Colors.green,),
            Container(color: Colors.blue,),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavyBar(
        selectedIndex: _currentIndex,
        onItemSelected: (index) {
          setState(() => _currentIndex = index);
          _pageController.jumpToPage(index);
        },
        items: <BottomNavyBarItem>[
          BottomNavyBarItem(
              title: Text('Escanear QR'),
              icon: Icon(Icons.qr_code_scanner)
          ),
          BottomNavyBarItem(
              title: Text('Diario'),
              icon: Icon(Icons.book)
          ),
          BottomNavyBarItem(
              title: Text('Sala'),
              icon: Icon(Icons.room)
          ),
          BottomNavyBarItem(
              title: Text('Inventario'),
              icon: Icon(Icons.inventory)
          ),
        ],
      ),
    );
  }



/*
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("QR Scan")),
      body: Container(
          alignment: Alignment.center,
          child: Flex(
            direction: Axis.vertical,
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              ElevatedButton(
               onPressed: () => scanQR(),
                child: Text('Start QR scan')),
              if(_scanBarcode.isNotEmpty) ElevatedButton(
                onPressed: () => _makePostRequest(_scanBarcode),
                child: Text('GO')),
              Text('Scan result : $_scanBarcode\n',
              style: TextStyle(fontSize: 20))]
          )),
        bottomNavigationBar: BottomNavyBar(
          selectedIndex: _currentIndex,
          showElevation: true,
          itemCornerRadius: 24,
          curve: Curves.easeIn,
          onItemSelected: (index) => setState(() => _currentIndex = index),
          items: <BottomNavyBarItem>[
            BottomNavyBarItem(
              icon: Icon(Icons.apps),
              title: Text('Home'),
              activeColor: Colors.red,
              textAlign: TextAlign.center,
            ),
            BottomNavyBarItem(
              icon: Icon(Icons.people),
              title: Text('Users'),
              activeColor: Colors.purpleAccent,
              textAlign: TextAlign.center,
            ),
            BottomNavyBarItem(
              icon: Icon(Icons.message),
              title: Text(
                'Messages test for mes teset test test ',
              ),
              activeColor: Colors.pink,
              textAlign: TextAlign.center,
            ),
            BottomNavyBarItem(
              icon: Icon(Icons.settings),
              title: Text('Settings'),
              activeColor: Colors.blue,
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
  }
*/
}




