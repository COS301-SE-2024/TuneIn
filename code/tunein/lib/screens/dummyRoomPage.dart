import 'package:flutter/material.dart';
import 'models/dummyRoom.dart';

class DummyRoomPage extends StatelessWidget {
  final DummyRoom dummyRoom;

  const DummyRoomPage({Key? key, required this.dummyRoom}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(dummyRoom.name),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Now playing - ${dummyRoom.songName} by ${dummyRoom.artistName}',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 10),
            Text(
              'Description: ${dummyRoom.description}',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 10),
            Text(
              'Hosted by: ${dummyRoom.username}',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 10),
            Text(
              'Tags: ${dummyRoom.tags.join(', ')}',
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 10),
            CircleAvatar(
              backgroundImage: NetworkImage(dummyRoom.userProfile),
              radius: 30,
            ),
          ],
        ),
      ),
    );
  }
}
