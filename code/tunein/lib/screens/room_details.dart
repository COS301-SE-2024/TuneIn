import 'package:flutter/material.dart';

class RoomDetailsScreen extends StatefulWidget {
  @override
  _RoomDetailsScreenState createState() => _RoomDetailsScreenState();
}

class _RoomDetailsScreenState extends State<RoomDetailsScreen> {
  bool isNsfw = false;
  bool isExplicit = false;

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
          'Room Details',
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView( // Wrap the Column with SingleChildScrollView
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildInputField('Name', mediaQuery),
              SizedBox(height: 20),
              _buildInputField('Description', mediaQuery, maxLines: 4),
              SizedBox(height: 20),
              _buildInputField('Genre', mediaQuery),
              SizedBox(height: 20),
              _buildInputField('Language', mediaQuery),
              SizedBox(height: 10),
              _buildToggle('Explicit', isExplicit, (value) {
                setState(() {
                  isExplicit = value;
                });
              }),
              SizedBox(height: 0),
              _buildToggle('NSFW', isNsfw, (value) {
                setState(() {
                  isNsfw = value;
                });
              }),
              SizedBox(height: 0),
              TextButton.icon(
                onPressed: () {
                  // Handle photo selection
                },
                icon: Icon(Icons.photo),
                label: Text(
                  'Photo',
                  style: TextStyle(
                    fontFamily: 'Poppins',
                    fontSize: 16,
                  ),
                ),
              ),
              SizedBox(height: 20),
              SizedBox(
                width: mediaQuery.size.width * 0.85,
                height: 60,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/nextScreen');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF8B8FA8),
                  ),
                  child: Text(
                    'Share',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInputField(String labelText, MediaQueryData mediaQuery, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          labelText,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        SizedBox(height: 8),
        TextField(
          maxLines: maxLines,
          decoration: InputDecoration(
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(
                color: Colors.grey,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(
                color: Colors.blue,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildToggle(String labelText, bool value, Function(bool) onChanged) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          labelText,
          style: TextStyle(
            fontFamily: 'Poppins',
            fontSize: 16,
            fontWeight: FontWeight.w500,
          ),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

void main() {
  runApp(MaterialApp(
    home: RoomDetailsScreen(),
  ));
}
