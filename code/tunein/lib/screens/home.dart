import 'package:flutter/material.dart';
import './models/roomCards.dart'; // Import RoomCard class from its file location
import './widgets/roomCardsWidget.dart'; // Import RoomCardWidget widget from its file location

class HomePage extends StatelessWidget {
  const HomePage({Key? key});

  @override
  Widget build(BuildContext context) {
    // Dummy data for RoomCard
    final RoomCard roomCard = RoomCard(
      name: 'Chill Vibes',
      songName: 'Blinding Lights',
      artistName: 'The Weeknd',
      description: 'A room for chilling with good music',
      username: 'john_doe',
      userProfile: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg?w=826&t=st=1717185133~exp=1717185733~hmac=b58407c8fbdd6ed94271f6bab272ed224b26f7d5ea80a24bedff540109b58405',
      backgroundImage: 'https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      tags: ['chill', 'pop', '2020s'],
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('Home Page'),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            const Text(
              'Welcome to the Home Page!',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            RoomCardWidget(roomCard: roomCard), // Use RoomCardWidget with dummy data
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
}
