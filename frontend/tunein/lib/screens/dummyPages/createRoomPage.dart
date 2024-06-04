import 'package:flutter/material.dart';

class CreateRoomPage extends StatelessWidget {
  const CreateRoomPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Room'),
      ),
      body: Center(
        child: Text('This is the Create Room page'),
      ),
    );
  }
}
