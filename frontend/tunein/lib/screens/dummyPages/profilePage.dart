import 'package:flutter/material.dart';
import '../models/friends.dart';

class ProfilePage extends StatelessWidget {
  final Friend friend;

  const ProfilePage({required this.friend});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(friend.name),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(friend.profilePicture),
              radius: 50,
            ),
            SizedBox(height: 20),
            Text(
              friend.name,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
