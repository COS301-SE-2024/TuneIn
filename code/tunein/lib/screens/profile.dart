import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import '../models/user.dart'; // Import UserProfile model
import '../widgets/rooms_widget.dart';
import '../widgets/now_playing_widget.dart';
import '../widgets/favorite_song_widget.dart';
import '../widgets/genre_widget.dart';
import '../widgets/bio_section_widget.dart';
import 'edit_profile.dart'; // Import EditProfileScreen
import 'package:supabase_flutter/supabase_flutter.dart';
// import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'supabase_service.dart';

final SupabaseClient client = Supabase.instance.client;

class ProfileScreen extends StatelessWidget {
  final UserProfile userProfile;
  static final SupabaseService supabaseService = SupabaseService.instance;

  const ProfileScreen({super.key, required this.userProfile});

  void _navigateToEditProfile(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => EditProfileScreen(
          userProfile: userProfile,
          onSave: (updatedProfile) {
            // Handle the updated profile
            // For now, just print it to the console
            print(updatedProfile.name);
          },
        ),
      ),
    );
  }

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
    "roomName": "Peaceful Beats Here",
    "songName": "Chill Vibes",
    "artistName": "Calm Artist",
    "username": "User2"
},
{
    "roomName": "Rock N' Roll 10",
    "songName": "Rock Anthem",
    "artistName": "Rock Legend",
    "username": "User3"
},
    ];

    final List<Map<String, String>> recentRooms = [
      {
    "roomName": "Jazzy Grooves",
    "songName": "Smooth Jazz",
    "artistName": "Jazz Master",
    "username": "User4"
},
{
    "roomName": "Pop Paradise Blue",
    "songName": "Top Pop Song",
    "artistName": "Pop Star",
    "username": "User5"
}
    ];

    return Scaffold(
      body: FutureBuilder<Map<String, dynamic>>(
          future: _fetchData(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text('Error: ${snapshot.error}'));
            } else {
              final String username = snapshot.data!['username'];
              final String Bio = snapshot.data!['bio'];
              final String profilePic = snapshot.data!['profile_picture'];

              return SingleChildScrollView(
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
                            image: DecorationImage(
                              image: NetworkImage(cleanProfilePic(profilePic)),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 10),
                    Text(username,
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.w600)),
                    Text('@${username}',
                        style: TextStyle(fontWeight: FontWeight.w400)),
                    SizedBox(height: 10),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
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
                    Text(
                      userProfile.socialLinks.isNotEmpty
                          ? 'instagram.com/max'
                          : 'No social links available',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    SizedBox(height: 20),
                    SizedBox(
                      width: 155,
                      height: 37,
                      child: ElevatedButton(
                        onPressed: () => _navigateToEditProfile(context),
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
                      title: favoriteSongs[0]["title"]!,
                      artist: favoriteSongs[0]["artist"]!,
                      duration: favoriteSongs[0]["duration"]!,
                    ),
                    SizedBox(height: 20),
                    BioSection(
                      content: Bio,
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
                    SizedBox(
                      height: 20,
                    ),
                    FavoriteSongsList(songs: favoriteSongs),
                    // FavoriteRoomItem(),
                    // SizedBox(height: 20),
                    // RecentRooms(),
                    // SizedBox(height: 20),
                    // Center(child: GenreList(items: userProfile.genres)),
                    // SizedBox(height: 20),
                    // FavoriteSongsList(songs: favoriteSongs),
                    // SizedBox(height: 20),
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
              );
            }
          }),
    );
  }
}

Future<Map<String, dynamic>> _fetchData() async {
  // await Supabase.initialize(
  //   url: "https://fhedmgsybptxgzjkaifd.supabase.co",
  //   anonKey:
  //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZWRtZ3N5YnB0eGd6amthaWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxODUyMDMsImV4cCI6MjAzMjc2MTIwM30.N7Rj-vT-GTCcQ69Kq-kVGy7_iiTciUpbTaF3J2jKJVg",
  // );
  final results = SupabaseService.instance
      .getProfileInfo("ac34854d-8f9f-489d-aca3-d8a930b4b8b5");

  return results;
}

String cleanProfilePic(String pp) {
  return pp.replaceAll("'", "").replaceAll(",", "").trim();
}
