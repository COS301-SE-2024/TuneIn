// chat_room.dart
import 'package:flutter/material.dart';
import './my_toggle_widget.dart';
import '/routes/routes.dart';

class CreateRoomScreen extends StatefulWidget {
  @override
  _CreateRoomScreenState createState() => _CreateRoomScreenState();
}

class _CreateRoomScreenState extends State<CreateRoomScreen> {
  bool isSwitched = false;

  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.close),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        title: Text(
          'Room Option',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: EdgeInsets.symmetric(horizontal: 20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Center(
              child: MyToggleWidget(
                firstOption: 'Permanent',
                secondOption: 'Temporary',
                onChanged: (isFirstSelected) {
                  print(isFirstSelected
                      ? 'Permanent selected'
                      : 'Temporary selected');
                },
              ),
            ),
            SizedBox(height: 30),
            Center(
              child: MyToggleWidget(
                firstOption: 'Public',
                secondOption: 'Private',
                onChanged: (isFirstSelected) {
                  print(
                      isFirstSelected ? 'Public selected' : 'Private selected');
                },
              ),
            ),
            SizedBox(height: 40),
            TextField(
              decoration: InputDecoration(
                hintText: 'Add room name',
                hintStyle: TextStyle(
                  fontFamily: 'Poppins',
                  fontSize: 16,
                  color: Colors.grey,
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Colors.grey,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(
                    color: Color.fromARGB(255, 83, 83, 84),
                  ),
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Schedule for later',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 16,
                    fontWeight: FontWeight.w500, // Medium weight
                  ),
                ),
                Switch(
                  value: isSwitched,
                  onChanged: (value) {
                    setState(() {
                      isSwitched = value;
                    });
                  },
                ),
              ],
            ),
            SizedBox(height: 30),
            SizedBox(
              width: mediaQuery.size.width * 0.9, // 3/4 of the screen width
              height: 60,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pushNamed(context,
                      Routes.roomDetails); // Replace with your actual route
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF8B8FA8), // Button color
                ),
                child: Text(
                  'Let\'s Go',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            SizedBox(height: 270),
          ],
        ),
      ),
    );
  }
}

void main() {
  runApp(MaterialApp(
    home: CreateRoomScreen(),
  ));
}
