import 'package:flutter/material.dart';

class LoginOtherScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Login Other'),
      ),
      body: Center(
        child: Text(
          'Login Other Screen',
          style: TextStyle(fontSize: 24),
        ),
      ),
    );
  }
}
