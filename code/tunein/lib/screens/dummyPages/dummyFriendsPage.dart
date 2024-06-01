import 'package:flutter/material.dart';
import '../models/friends.dart';
import '../widgets/friendCard.dart';

class DummyFriendsPage extends StatelessWidget {
  const DummyFriendsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('All Friends'),
      ),
      body: ListView(
        padding: EdgeInsets.all(16.0),
        children: _buildFriendsList(context),
      ),
    );
  }

  List<Widget> _buildFriendsList(BuildContext context) {
    List<Friend> friends = _getFriends();

    return friends.map((friend) {
      return FriendCard(friend: friend);
    }).toList();
  }

  List<Friend> _getFriends() {
    // Replace this with your actual list of friends
    return [
      Friend(name: 'Alice', profilePicture: 'assets/alice.jpg'),
      Friend(name: 'Bob', profilePicture: 'assets/bob.jpg'),
      // Add more friends here
    ];
  }
}
