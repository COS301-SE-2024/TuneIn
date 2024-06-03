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
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView(
          children: [
            _buildDetailItem('Song Name', room.songName),
            _buildDetailItem('Artist Name', room.artistName),
            _buildDetailItem('Description', room.description),
            _buildDetailItem('Username', room.username),
            _buildDetailItem('User Profile', room.userProfile),
            _buildDetailItem('Background Image', room.backgroundImage),
            _buildDetailItem('Tags', room.tags.join(', ')),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String title, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        SizedBox(height: 8),
        Text(
          value,
          style: TextStyle(fontSize: 16),
        ),
        Divider(), // Add a divider between details
      ],
    );
  }
}
