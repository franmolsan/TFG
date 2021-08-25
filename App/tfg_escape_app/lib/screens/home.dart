import 'dart:convert';

import 'package:bottom_navy_bar/bottom_navy_bar.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_barcode_scanner/flutter_barcode_scanner.dart';
import 'package:tfg_escape_app/models/diary_entry.dart';
import 'package:tfg_escape_app/models/game_state.dart';
import 'package:tfg_escape_app/service/api.dart';

class MyHomePage extends StatefulWidget {

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _scanBarcode = '';
  int _currentIndex = 0;
  GameState currentGameState = GameState.emptyState();
  PageController _pageController = PageController();
  String userId = "";
  Future<Map>? rooms;
  bool firstBuild = true;
  Map diaryEntries = new Map();

  String currentRoomName = "sala 2";

  void getRoomsAndGamestate(userID) async{
    rooms =  getRooms();
    currentGameState = await getGamestate(userID);
  }

  void getCurrentGamestate(userID) async{
    currentGameState = await getGamestate(userID);
  }

  void readJson() async {
    final String response = await rootBundle.loadString('assets/diary.json');

    Map responseJson = json.decode(response);
    responseJson.forEach((key, value) {
      diaryEntries[key] = (DiaryEntry.fromJson(value));
      print("creo entrada diario");
    });
  }

  // This function is triggered when the user tap on a product
  void _goToSingle(context, entry) {
    Navigator.of(context)
        .pushNamed("/single-entry", arguments: entry);
  }

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
        child: Column (
          children: [
            Container(
                padding: const EdgeInsets.all(8),
                child: Container(
                    padding: EdgeInsets.fromLTRB(20, 20, 20, 20),
                    child:
                    Text(
                      'Entradas del diario',
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
                  child: ListView.builder(
                      itemCount: currentGameState.diaryEntriesUnlocked.length,
                      itemBuilder: (BuildContext context, int index) {
                        return TextButton(
                            onPressed: () =>_goToSingle(context, diaryEntries[currentGameState.diaryEntriesUnlocked[index]]),
                            child: ListTile(
                              title: Text(diaryEntries[currentGameState.diaryEntriesUnlocked[index]].date),
                              subtitle: Text(diaryEntries[currentGameState.diaryEntriesUnlocked[index]].time),
                            )
                        );
                      }
                  ),
                )
            )
          ],
        )
    );
  }

  Widget RoomScreen (BuildContext context) {
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
                       'Objetos en ${currentGameState.currentRoomName}',
                       style: TextStyle(
                           fontWeight: FontWeight.bold,
                           color: Colors.blue,
                           fontSize: 18
                       ),
                     )
                 )
            ),
            Expanded(
                child:
                 FutureBuilder(
                    future: rooms,
                    builder:(context, AsyncSnapshot snapshot) {
                      if (!snapshot.hasData) {
                        return Center(child: CircularProgressIndicator());
                      } else {
                        return Container(
                             child: ListView.builder(
                                 itemCount: snapshot.data[currentGameState.currentRoomName].elements.length,
                                 itemBuilder: (BuildContext context, int index) {
                                   return ListTile(
                                       title: Text('${snapshot.data[currentGameState.currentRoomName].elements[index].name}')); // [snapshot.data.currentRoomName]._elements[index].name}
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
              child: Container(
                   child: ListView.builder(
                       itemCount: currentGameState.inventory.length,
                       itemBuilder: (BuildContext context, int index) {
                         return ListTile(
                            title: Text('${currentGameState.inventory[index].name}'));
                     }
                  ),
              )
            )
          ],
        )
      );
  }


  @override
  Widget build(BuildContext context) {

    if (firstBuild){
      print ("se construye");
      userId = ModalRoute.of(context)!.settings.arguments.toString();
      getRoomsAndGamestate(userId);
      readJson();
      firstBuild = false;
    }

    return Scaffold(
      appBar: AppBar(title: Text("Escape App")),
      body: SizedBox.expand(
        child: PageView(
          controller: _pageController,
          onPageChanged: (index) {
            getCurrentGamestate(userId);
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