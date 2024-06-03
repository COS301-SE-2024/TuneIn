import 'package:flutter/material.dart';
import '../models/friends.dart';
import '../dummyPages/profilePage.dart';

class FriendCard extends StatelessWidget {
  final Friend friend;

  const FriendCard({required this.friend});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProfilePage(friend: friend),
          ),
        );
      },
      child: Card(
        child: Row(
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(friend.profilePicture),
              radius: 30,
            ),
            SizedBox(width: 10),
            Text(friend.name),
          ],
        ),
      ),
    );
  }
}
