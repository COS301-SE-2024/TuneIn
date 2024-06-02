import 'package:flutter/material.dart';
import '../models/room.dart';

class EditRoomPage extends StatelessWidget {
  final Room room;

  const EditRoomPage({Key? key, required this.room}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Edit Room'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Editing Room: ${room.name}'),
            ElevatedButton(
              onPressed: () {
                // Perform edit operation
                Navigator.pop(context);
              },
              child: Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }
}
