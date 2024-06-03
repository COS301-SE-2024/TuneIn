import 'package:flutter/material.dart';
import './models/room.dart';
import './models/friends.dart';
import './widgets/roomCardsWidget.dart';
import './widgets/friendCard.dart';
import './dummyPages/roomPage.dart';
import './dummyPages/createRoomPage.dart';
import './dummyPages/friendsPage.dart';
import 'supabase_service.dart'; // Import SupabaseService

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder<Map<String, dynamic>>(
        future: _fetchData(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else {
            final List<Room> myRooms = snapshot.data!['myRooms'];
            final List<Room> recentRooms = snapshot.data!['recentRooms'];
            final List<Room> picksForYou = snapshot.data!['picksForYou'];
            final List<Friend> friends = snapshot.data!['friends'];

            return CustomScrollView(
              slivers: <Widget>[
                const SliverAppBar(
                  automaticallyImplyLeading: false,
                  pinned: false,
                  title: Text(
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
                        _buildRoomList(context, 'Recent Rooms', recentRooms),
                        const SizedBox(height: 20),
                        _buildRoomList(context, 'Picks for You', picksForYou),
                        const SizedBox(height: 20),
                        _buildSectionTitle('Friends'),
                        friends.isEmpty
                            ? const Text('No friends')
                            : _buildFriendsGrid(friends),
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
                        _buildRoomList(context, 'My Rooms', myRooms),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ],
            );
          }
        },
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

  Future<Map<String, dynamic>> _fetchData() async {
    final myRooms = SupabaseService.instance.getMyRooms();
    final recentRooms = SupabaseService.instance.getRecentRooms();
    final picksForYou = SupabaseService.instance.getPicksForYou();
    final friends = SupabaseService.instance.getFriends();

    final results =
        await Future.wait([myRooms, recentRooms, picksForYou, friends]);

    return {
      'myRooms': results[0],
      'recentRooms': results[1],
      'picksForYou': results[2],
      'friends': results[3],
    };
  }

  Widget _buildRoomList(BuildContext context, String title, List<Room> rooms) {
    final bool isMine = title == 'My Rooms';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSectionTitle(title),
        SizedBox(
          height: 230,
          child: rooms.isEmpty
              ? const Text('No rooms')
              : ListView.builder(
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

  Widget _buildFriendsGrid(List<Friend> friends) {
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
}
