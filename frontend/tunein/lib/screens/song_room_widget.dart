import 'package:flutter/material.dart';

class SongRoomWidget extends StatelessWidget {
  final String songName;
  final String artist;
  final double progress;
  final String time1;
  final String time2;

  SongRoomWidget({
    required this.songName,
    required this.artist,
    required this.progress,
    required this.time1,
    required this.time2,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      // height: MediaQuery.of(context).size.height * 0.45, // Half of screen height
      width: double.infinity,
      color: Colors.white,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(12.0),
            child: Image(
              image: AssetImage('assets/blank.png'), // Placeholder image path
              height: 200, // Adjust the image height as needed
              fit: BoxFit.cover,
            ),
          ),
          SizedBox(height: 16),
          Text(
            songName,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.black,
            ),
          ),
          SizedBox(height: 8),
          Text(
            artist,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(width: 20),
              Expanded(
                child: Slider(
                  value: progress,
                  onChanged: (newValue) {
                    // Update the song progress
                  },
                  activeColor: Colors.black,
                  inactiveColor: Colors.grey.withOpacity(0.5),
                ),
              ),
              SizedBox(width: 20),
            ],
          ),
          SizedBox(height: 0),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SizedBox(width: 40), // Padding for the first time number
              Text(
                time1, // First time number
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF878787),
                  fontWeight: FontWeight
                      .bold, // Bold font weight for the first time number
                ),
              ),
              Spacer(), // Add space between the time numbers
              Text(
                time2, // Second time number
                style: TextStyle(
                  fontSize: 12,
                  color: Color(0xFF878787),
                  fontWeight: FontWeight
                      .bold, // Bold font weight for the second time number
                ),
              ),
              SizedBox(width: 40), // Padding for the second time number
            ],
          ),
        ],
      ),
    );
  }
}
