import 'package:flutter/material.dart';
import 'title_widget.dart';

class FavoriteSongItem extends StatelessWidget {
  const FavoriteSongItem({
    Key? key,
    required this.title,
    required this.artist,
    required this.duration,
    required this.onMorePressed,
  }) : super(key: key);

  final String title;
  final String artist;
  final String duration;
  final VoidCallback onMorePressed;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 15, right: 25),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Container(
              width: 57,
              height: 57,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                color: Color.fromRGBO(158, 171, 184, 1),
              ),
            ),
          ),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: 5),
                Text(
                  artist,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),
          Text(
            duration,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w400,
            ),
          ),
          SizedBox(width: 25), // Adjust the width as needed
          IconButton(
            onPressed: onMorePressed,
            icon: Icon(Icons.more_horiz),
          ),
        ],
      ),
    );
  }
}

class FavoriteSongsList extends StatelessWidget {
  final List<Map<String, String>> songs;

  const FavoriteSongsList({super.key, required this.songs});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 32, right: 32),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Favorite Songs",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.start,
              ),
              GestureDetector(
                onTap: () {
                  // Handle "More" button press
                },
                child: Text(
                  'More',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 5),
        ...songs.map((song) {
          return FavoriteSongItem(
            title: song['title']!,
            artist: song['artist']!,
            duration: song['duration']!,
            onMorePressed: () {
              // Handle more button press
            },
          );
        }).toList(),
      ],
    );
  }
}
