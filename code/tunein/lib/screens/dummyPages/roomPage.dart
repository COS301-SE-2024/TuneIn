import 'package:flutter/material.dart';
import '../models/room.dart'; // Import Room model

class RoomPage extends StatelessWidget {
  final Room room;

  const RoomPage({Key? key, required this.room}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(room.name),
      ),
      body: Center(
        child: Text('Room Details: ${room.description}'),
      ),
    );
  }
}
