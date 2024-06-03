import 'package:flutter/material.dart';
import './comment_widget.dart';
import './song_room_widget.dart';

class ChatRoomScreen extends StatefulWidget {
  @override
  _ChatRoomScreenState createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  bool isChatExpanded = false;

  final List<Map<String, String>> comments = [
    {
      'username': 'Jasmine',
      'message': 'I love this song',
      'profilePictureUrl': 'https://via.placeholder.com/150/9EABB8/ffffff',
    },
    {
      'username': 'Alex',
      'message': 'Great tune!',
      'profilePictureUrl': 'https://via.placeholder.com/150/9EABB8/ffffff',
    },
    {
      'username': 'Chris',
      'message': 'Awesome beat!',
      'profilePictureUrl': 'https://via.placeholder.com/150/9EABB8/ffffff',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                // Navigate back
              },
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.more_horiz),
            onPressed: () {
              // Add your action here
            },
          ),
        ],
      ),
      body: Column(
        children: [
          SizedBox(height: 10),
          Flexible(
            flex: isChatExpanded ? 0 : 100,
            child: SongRoomWidget(
              songName: 'Your Song Name',
              artist: 'Your Artist',
              progress: 0.5, // Example progress value
              time1: '1:30', // Example time value
              time2: '3:00', // Example time value
            ),
          ),
          if (!isChatExpanded) ...[
            SizedBox(height: 10),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 60, vertical: 50),
              color: Colors.white,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.person, size: 24),
                      SizedBox(width: 4),
                      Text('Host', style: TextStyle(fontSize: 16)),
                    ],
                  ),
                  Row(
                    children: [
                      Icon(Icons.playlist_play, size: 24),
                      SizedBox(width: 4),
                      Text('Playlist', style: TextStyle(fontSize: 16)),
                    ],
                  ),
                ],
              ),
            ),
            SizedBox(height: 10),
            Divider(),
          ],
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(width: 20), // Add spacing here
              Text(
                'Chat',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: Icon(isChatExpanded
                    ? Icons.keyboard_arrow_down
                    : Icons.keyboard_arrow_up),
                onPressed: () {
                  setState(() {
                    isChatExpanded = !isChatExpanded;
                  });
                },
              ),
            ],
          ),
          Divider(),
          SizedBox(height: 10),
          Expanded(
            child: isChatExpanded
                ? ListView.builder(
                    itemCount: comments.length,
                    itemBuilder: (context, index) {
                      final comment = comments[index];
                      return CommentWidget(
                        username: comment['username']!,
                        message: comment['message']!,
                        profilePictureUrl: comment['profilePictureUrl']!,
                      );
                    },
                  )
                : SizedBox(),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(
                    'https://via.placeholder.com/150/9EABB8/ffffff',
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.grey[200],
                    ),
                    child: TextField(
                      decoration: InputDecoration(
                        hintText: 'Type your message...',
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(
                          vertical: 12,
                          horizontal: 20,
                        ),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                IconButton(
                  icon: Icon(Icons.send),
                  onPressed: () {
                    // Send message functionality
                  },
                ),
              ],
            ),
          ),
          SizedBox(height: 16),
        ],
      ),
    );
  }
}
