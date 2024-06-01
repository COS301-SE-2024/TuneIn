import 'package:flutter/material.dart';
import '../models/dummyRoom.dart'; // Import DummyRoom model

class DummyRoomPage extends StatelessWidget {
  final DummyRoom dummyRoom;

  const DummyRoomPage({Key? key, required this.dummyRoom}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(dummyRoom.name),
      ),
      body: Center(
        child: Text('Room Details: ${dummyRoom.description}'),
      ),
    );
  }
}
