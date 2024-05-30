import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '/routes/routes.dart';

class WelcomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);

    return Scaffold(
      body: Column(
        children: [
          // Image taking up half the screen
          Container(
            height: mediaQuery.size.height * 0.5,
            width: double.infinity,
            decoration: BoxDecoration(
              image: DecorationImage(
                image: AssetImage('assets/blank.png'), // Make sure to add the image in your assets
                fit: BoxFit.cover,
              ),
            ),
          ),
          // Text elements and buttons
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Text "Logo"
                  Text(
                    'Logo',
                    style: GoogleFonts.poppins(
                      textStyle: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  SizedBox(height: 20), // Bigger gap between "Logo" text and image
                  // Text "TuneIn"
                  Text(
                    'TuneIn',
                    style: GoogleFonts.poppins(
                      textStyle: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  SizedBox(height: 30), // Smaller gap between "TuneIn" text and buttons
                  // Login button
                  SizedBox(
                    width: mediaQuery.size.width * 0.75, // 3/4 of the screen width
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, Routes.login);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF8B8FA8), // Login button color
                      ),
                      child: Text(
                        'Login',
                        style: TextStyle(color: Colors.white), // White text color for login button
                      ),
                    ),
                  ),
                  SizedBox(height: 20), // Bigger gap between buttons
                  // Register button
                  SizedBox(
                    width: mediaQuery.size.width * 0.75, // 3/4 of the screen width
                    height: 50,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pushNamed(context, Routes.register);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white, // Register button color
                      ),
                      child: Text(
                        'Register',
                        style: TextStyle(color: Colors.black), // Black text color for register button
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
