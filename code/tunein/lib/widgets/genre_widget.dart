import 'package:flutter/material.dart';
import 'genre_bubble.dart';

class GenreList extends StatelessWidget {
  final List<String> items;

  const GenreList({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start, // Aligns text to the start
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Text(
            "Favorite Genres",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        SizedBox(height: 20),
        Container(
          height: 32,
          child: ListView.builder(
            padding: EdgeInsets.only(left: 20), // Matches the horizontal padding of the text
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            itemBuilder: (context, index) {
              return GenreBubble(text: items[index]);
            },
          ),
        ),
      ],
    );
  }
}
