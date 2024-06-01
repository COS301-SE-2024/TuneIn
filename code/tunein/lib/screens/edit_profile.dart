import 'package:flutter/material.dart';
import '/routes/routes.dart';

class EditProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Edit Profile'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pushNamed(context, Routes.profile);
            },
            child: Text(
              'Save',
              style: TextStyle(
                color: Colors.black,
                fontSize: 16,
              ),
            ),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Edit Profile Screen',
              style: TextStyle(fontSize: 24),
            ),
            // Removed the button here as per your instructions
          ],
        ),
      ),
    );
  }
}
