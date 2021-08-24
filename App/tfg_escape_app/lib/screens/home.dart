import 'package:bottom_navy_bar/bottom_navy_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:tfg_escape_app/models/game_state.dart';
import 'package:tfg_escape_app/service/api.dart';

class MyHomePage extends StatefulWidget {

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _scanBarcode = '';
  int _currentIndex = 0;
  Future<GameState>? currentGameState;
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

  Widget QRScreen (BuildContext context) {
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
                  onPressed: () => makePostRequestScanQR(_scanBarcode),
                  child: Text('GO')),
              Text('Scan result : $_scanBarcode\n',
                  style: TextStyle(fontSize: 20))]
        ));
  }

  Widget DiaryScreen (BuildContext context) {
    return Container(
        alignment: Alignment.center,
        child: ListView(
          children: <Widget>[
            ListTile(
              leading: Icon(Icons.map),
              title: Text('Map'),
            ),
            ListTile(
              leading: Icon(Icons.photo_album),
              title: Text('Album'),
            ),
            ListTile(
              leading: Icon(Icons.phone),
              title: Text('Phone'),
            ),
          ],
        ));
  }

  Widget RoomScreen (BuildContext context) {
    return Container(
        alignment: Alignment.center,
        child: ListView(
          children: <Widget>[
            ListTile(
              leading: Icon(Icons.map),
              title: Text('Map'),
            ),
            ListTile(
              leading: Icon(Icons.photo_album),
              title: Text('Album'),
            ),
            ListTile(
              leading: Icon(Icons.phone),
              title: Text('Phone'),
            ),
          ],
        ));
  }
  Widget InventaryScreen (BuildContext context) {
    return Container(
        alignment: Alignment.center,
        child: Column (
          children: [
            Container(
            padding: const EdgeInsets.all(8),

              child: Container(
                padding: EdgeInsets.fromLTRB(20, 20, 20, 20),
                child:
                  Text(
                    'Objetos en el inventario',
                    style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                        fontSize: 18
                  ),
                )
    )
            ),
            Expanded(
            child: FutureBuilder(
                future: currentGameState,
                builder:(context, AsyncSnapshot snapshot) {
                  if (!snapshot.hasData) {
                    return Center(child: CircularProgressIndicator());
                  } else {
                    return Container(
                        child: ListView.builder(
                            itemCount: snapshot.data.inventory.length,
                            itemBuilder: (BuildContext context, int index) {
                              return ListTile(
                                  title: Text('${snapshot.data.inventory[index].name}'));
                            }
                        )
                    );
                  }
                }
            ))
          ],
        )
      );
  }


  @override
  Widget build(BuildContext context) {
    final userId = ModalRoute.of(context)!.settings.arguments.toString();
    return Scaffold(
      appBar: AppBar(title: Text("Escape App")),
      body: SizedBox.expand(
        child: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            currentGameState = getGamestate(userId);
            setState(() => _currentIndex = index);
          },
          children: <Widget>[
            QRScreen(context),
            DiaryScreen(context),
            RoomScreen(context),
            InventaryScreen(context),
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

}