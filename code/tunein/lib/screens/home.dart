import 'package:flutter/material.dart';
import './models/roomCards.dart'; // Import RoomCard class from its file location
import './widgets/roomCardsWidget.dart'; // Import RoomCardWidget widget from its file location
import './models/dummyRoom.dart';
import './dummyRoomPage.dart';

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false, // Remove the back button
        title: Text(
          'TuneIn', // Change the title to TuneIn
          style: TextStyle(
            fontWeight: FontWeight.bold, // Make it bold
            fontSize: 26, // Change the font size
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            _buildRoomList(
              context,
              title: 'Recent Rooms',
              rooms: _getRecentRooms(),
            ),
            const SizedBox(
                height: 20), // Added some space between the carousel and button
            _buildRoomList(
              context,
              title: 'Picks for You',
              rooms: _getPicksForYou(),
            ),
            const SizedBox(
                height: 20), // Added some space between the carousel and button
            _buildSectionTitle('Friends'),
            // Placeholder for friends section
            SizedBox(
              height: 100,
              child: Center(
                child: Text('Friends section content'),
              ),
            ),
            const SizedBox(
                height: 20), // Added some space between the carousel and button
            ElevatedButton(
              onPressed: () {
                // Navigate back to the login page or another page if needed
                Navigator.pop(context);
              },
              child: const Text('Go Back to Login'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoomList(
    BuildContext context, {
    required String title,
    required List<RoomCard> rooms,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        SizedBox(
          height: 230, // Set a fixed height for the carousel
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemExtent:
                MediaQuery.of(context).size.width * 0.85, // Adjust as needed
            itemCount: rooms.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () {
                  // Create a DummyRoom object from RoomCard data
                  DummyRoom dummyRoom = DummyRoom(
                    name: rooms[index].name,
                    songName: rooms[index].songName,
                    artistName: rooms[index].artistName,
                    description: rooms[index].description,
                    username: rooms[index].username,
                    userProfile: rooms[index].userProfile,
                    backgroundImage: rooms[index].backgroundImage,
                    tags: rooms[index].tags,
                  );

                  // Navigate to DummyRoomPage with the corresponding DummyRoom
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => DummyRoomPage(dummyRoom: dummyRoom),
                    ),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5.0),
                  child: RoomCardWidget(roomCard: rooms[index]),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: Text(
        title,
        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  List<RoomCard> _getRecentRooms() {
    return [
      RoomCard(
        name: 'Chill Vibes',
        songName: 'Blinding Lights',
        artistName: 'The Weeknd',
        description: 'A room for chilling with good music',
        username: 'john_doe',
        userProfile:
            'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=826&t=st=1717185133~exp=1717185733~hmac=b58407c8fbdd6ed94271f6bab272ed224b26f7d5ea80a24bedff540109b58405',
        backgroundImage:
            'https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        tags: ['chill', 'pop', '2020s'],
      ),
      RoomCard(
        name: 'Party Hits',
        songName: 'Levitating',
        artistName: 'Dua Lipa',
        description: 'A room for the best party hits',
        username: 'jane_doe',
        userProfile:
            'https://img.freepik.com/free-photo/smiling-young-man-wearing-sunglasses_171337-18683.jpg',
        backgroundImage:
            'https://images.pexels.com/photos/1449799/pexels-photo-1449799.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        tags: ['party', 'dance', '2020s'],
      ),
      RoomCard(
        name: 'Relaxing Beats',
        songName: 'Shape of You',
        artistName: 'Ed Sheeran',
        description: 'A room for relaxing beats',
        username: 'mary_smith',
        userProfile: 'https://example.com/user_profiles/mary_smith.jpg',
        backgroundImage:
            'https://example.com/background_images/relaxing_beats.jpg',
        tags: ['relax', 'pop', '2010s'],
      ),
    ];
  }

  List<RoomCard> _getPicksForYou() {
    return [
      RoomCard(
        name: 'Relaxing Tunes',
        songName: 'Someone Like You',
        artistName: 'Adele',
        description: 'A room for relaxing tunes',
        username: 'alice',
        userProfile:
            'https://img.freepik.com/free-photo/beautiful-woman-face-close-up-young-girl-model-with-perfect-clean-skin-isolated-white-wall-studio-natural-makeup-beauty-treatment-spa-wellness_155003-14608.jpg',
        backgroundImage:
            'https://images.pexels.com/photos/257360/pexels-photo-257360.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
        tags: ['relax', 'soul', '2010s'],
      ),
      RoomCard(
        name: 'Groovy Hits',
        songName: 'Uptown Funk',
        artistName: 'Mark Ronson ft. Bruno Mars',
        description: 'A room for groovy hits',
        username: 'robert_johnson',
        userProfile: 'https://example.com/user_profiles/robert_johnson.jpg',
        backgroundImage:
            'https://example.com/background_images/groovy_hits.jpg',
        tags: ['groove', 'funk', '2010s'],
      ),
      RoomCard(
        name: 'Study Vibes',
        songName: 'Instrumental Study Playlist',
        artistName: 'Various Artists',
        description: 'A room for studying with instrumental music',
        username: 'emily_williams',
        userProfile: 'https://example.com/user_profiles/emily_williams.jpg',
        backgroundImage:
            'https://example.com/background_images/study_vibes.jpg',
        tags: ['study', 'instrumental', 'focus'],
      ),
    ];
  }
}
