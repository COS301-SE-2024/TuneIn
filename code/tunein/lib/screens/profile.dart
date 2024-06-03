import 'package:flutter/material.dart';
import '../widgets/rooms_widget.dart';
import '../widgets/now_playing_widget.dart';
import '../widgets/favorite_song_widget.dart';
import '../widgets/genre_widget.dart';

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final List<Map<String, String>> favoriteSongs = [
      {
        "title": "Don't Smile At Me",
        "artist": "Billie Eilish",
        "duration": "5:33",
      },
      {
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "duration": "4:23",
      },
    ];

    final List<Map<String, String>> favoriteRooms = [
      {
        "roomName": "Favorite Room 1",
        "songName": "Favorite Song 1",
        "artistName": "Favorite Artist 1",
        "username": "User1",
      },
      {
        "roomName": "Favorite Room 2",
        "songName": "Favorite Song 2",
        "artistName": "Favorite Artist 2",
        "username": "User2",
      },
    ];

    final List<Map<String, String>> recentRooms = [
      {
        "roomName": "Recent Room 1",
        "songName": "Recent Song 1",
        "artistName": "Recent Artist 1",
        "username": "User1",
      },
      {
        "roomName": "Recent Room 2",
        "songName": "Recent Song 2",
        "artistName": "Recent Artist 2",
        "username": "User2",
      },
    ];

    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Container(),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 20.0),
                    child: IconButton(
                      icon: Icon(Icons.settings),
                      onPressed: () {
                        // Handle settings button press
                      },
                    ),
                  ),
                ],
              ),
            ),
            Text(
              "Profile",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 20,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 20),
            Stack(
              children: [
                Container(
                  width: 125,
                  height: 125,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color.fromRGBO(158, 171, 184, 1),
                  ),
                ),
              ],
            ),
            SizedBox(height: 10),
            Text("Jess Bailey",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            Text("@jessbailey", style: TextStyle(fontWeight: FontWeight.w400)),
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Column(
                  children: [
                    Text("17",
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.w600)),
                    Text("Followers",
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w400))
                  ],
                ),
                SizedBox(width: 60),
                Column(
                  children: [
                    Text("270",
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.w600)),
                    Text("Following",
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w400))
                  ],
                ),
              ],
            ),
            SizedBox(height: 30),
            Text("instagram.com/jessbailey and 2 more links",
                style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 20),
            SizedBox(
              width: 155,
              height: 37,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromRGBO(158, 171, 184, 1),
                    side: BorderSide.none,
                    shape: const StadiumBorder()),
                child: const Text("Edit",
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                    )),
              ),
            ),
            SizedBox(height: 20),
            NowPlaying(
              title: "Don't Smile At Me",
              artist: "Billie Eilish",
              duration: "3:05",
            ),
            SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.only(left: 32, right: 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Bio",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.start,
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ",
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w400,
                    ),
                    textAlign: TextAlign.start,
                    softWrap: true,
                    overflow: TextOverflow.visible,
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            Center(
                child: GenreList(items: const [
              "Pop",
              "Hip-Hop",
              "Jazz",
              "Classical",
              "Rock"
            ])),
            SizedBox(height: 20),
            FavoriteSongsList(songs: favoriteSongs),
            SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Favorite Rooms",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: favoriteRooms.map((room) {
                        return RoomCard(
                          roomName: room['roomName']!,
                          songName: room['songName']!,
                          artistName: room['artistName']!,
                          username: room['username']!,
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Recently Visited",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: recentRooms.map((room) {
                        return RoomCard(
                          roomName: room['roomName']!,
                          songName: room['songName']!,
                          artistName: room['artistName']!,
                          username: room['username']!,
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
