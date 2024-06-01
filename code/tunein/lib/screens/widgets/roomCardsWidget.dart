import 'package:flutter/material.dart';
import '../models/roomCards.dart';

class RoomCardWidget extends StatelessWidget {
  final RoomCard roomCard;

  const RoomCardWidget({Key? key, required this.roomCard}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(10),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Stack(
        children: [
          // Background image
          Container(
            height: 250,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(15),
              image: DecorationImage(
                image: NetworkImage(roomCard.backgroundImage),
                fit: BoxFit.cover,
                colorFilter: ColorFilter.mode(
                  Colors.black.withOpacity(0.6),
                  BlendMode.darken,
                ),
              ),
            ),
          ),
          // Room name and Now playing info
          Positioned(
            top: 15, // Added padding to the top
            left: 13,
            right: 13,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Room name
                Text(
                  roomCard.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 5),
                // Now playing info
                RichText(
                  text: TextSpan(
                    text: 'Now playing - ',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                    ),
                    children: [
                      TextSpan(
                        text: '${roomCard.songName} ',
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const TextSpan(
                        text: 'by ',
                        style: TextStyle(
                          fontWeight: FontWeight.normal,
                        ),
                      ),
                      TextSpan(
                        text: roomCard.artistName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          // Bottom content
          Positioned(
            left: 13,
            right: 13,
            bottom: 15,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Description
                Text(
                  roomCard.description,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis, // Handle long descriptions
                ),
                const SizedBox(height: 10),
                // User info and tags row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // User info
                    Row(
                      children: [
                        // User profile image with adjusted size
                        CircleAvatar(
                          backgroundImage: NetworkImage(roomCard.userProfile),
                          radius: 15, // Adjust the size as needed
                        ),
                        const SizedBox(width: 10),
                        // Username
                        Text(
                          roomCard.username,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                    // Tags
                    Flexible(
                      child: Text(
                        roomCard.tags.join(' • '),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
