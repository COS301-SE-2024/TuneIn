import 'package:flutter/material.dart';
import './models/room.dart';
import './widgets/roomCardsWidget.dart';
import './models/friends.dart';
import './widgets/friendCard.dart';
import './dummyPages/roomPage.dart';
import './dummyPages/createRoomPage.dart';
import './dummyPages/profilePage.dart';
import './dummyPages/editRoomPage.dart';
import './dummyPages/friendsPage.dart';

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: <Widget>[
          SliverAppBar(
            automaticallyImplyLeading: false,
            pinned: false,
            title: const Text(
              'TuneIn',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 26,
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverList(
              delegate: SliverChildListDelegate(
                [
                  _buildRoomList(context, 'Recent Rooms', _getRecentRooms()),
                  const SizedBox(height: 20),
                  _buildRoomList(context, 'Picks for You', _getPicksForYou()),
                  const SizedBox(height: 20),
                  _buildSectionTitle('Friends'),
                  _buildFriendsGrid(),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const FriendsPage(),
                        ),
                      );
                    },
                    child: const Text('Show All Friends'),
                  ),
                  const SizedBox(height: 20),
                  _buildRoomList(context, 'My Rooms', _getMyRooms()),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CreateRoomPage()),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildRoomList(BuildContext context, String title, List<Room> rooms) {
    final bool isMine = title == 'My Rooms';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        SizedBox(
          height: 230,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemExtent: MediaQuery.of(context).size.width * 0.85,
            itemCount: rooms.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => RoomPage(room: rooms[index]),
                    ),
                  );
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 5.0),
                  child: RoomCardWidget(room: rooms[index], mine: isMine),
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
        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildFriendsGrid() {
    final friends = _getFriends().take(6).toList();
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 10.0,
        crossAxisSpacing: 10.0,
        childAspectRatio: 2 / 1,
      ),
      itemCount: friends.length,
      itemBuilder: (context, index) {
        return FriendCard(friend: friends[index]);
      },
    );
  }

  List<Room> _getMyRooms() {
    // Replace this with your actual list of rooms created by the user
    return [
      Room(
        name: 'My Room 1',
        songName: 'Song Name 1',
        artistName: 'Artist Name 1',
        description: 'Description 1',
        username: 'username1',
        userProfile: 'profile1.jpg',
        backgroundImage: 'background1.jpg',
        tags: ['tag1', 'tag2'],
      ),
      Room(
        name: 'My Room 2',
        songName: 'Song Name 2',
        artistName: 'Artist Name 2',
        description: 'Description 2',
        username: 'username2',
        userProfile: 'profile2.jpg',
        backgroundImage: 'background2.jpg',
        tags: ['tag3', 'tag4'],
      ),
      // Add more rooms here
    ];
  }

  List<Friend> _getFriends() {
    return [
      Friend(
        name: 'Alice',
        profilePicture:
            'https://img.freepik.com/free-photo/beautiful-woman-face-close-up-young-girl-model-with-perfect-clean-skin-isolated-white-wall-studio-natural-makeup-beauty-treatment-spa-wellness_155003-14608.jpg',
      ),
      Friend(
        name: 'Bob',
        profilePicture:
            'https://img.freepik.com/free-photo/smiling-young-man-wearing-sunglasses_171337-18683.jpg',
      ),
      Friend(
        name: 'Charlie',
        profilePicture: 'https://example.com/user_profiles/charlie.jpg',
      ),
      Friend(
        name: 'David',
        profilePicture: 'https://example.com/user_profiles/david.jpg',
      ),
      Friend(
        name: 'Eve',
        profilePicture: 'https://example.com/user_profiles/eve.jpg',
      ),
      Friend(
        name: 'Frank',
        profilePicture: 'https://example.com/user_profiles/frank.jpg',
      ),
      Friend(
        name: 'Grace',
        profilePicture: 'https://example.com/user_profiles/grace.jpg',
      ),
      Friend(
        name: 'Grace',
        profilePicture: 'https://example.com/user_profiles/grace.jpg',
      ),
    ];
  }

  List<Room> _getRecentRooms() {
    return [
      Room(
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
      Room(
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
      Room(
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

  List<Room> _getPicksForYou() {
    return [
      Room(
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
      Room(
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
      Room(
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
