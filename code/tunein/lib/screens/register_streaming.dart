import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'login_streaming.dart';

class RegisterScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);

    return Scaffold(
      body: Container(
        padding: EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: EdgeInsets.only(top: 8), // Add top padding
                  child: Row(
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_back),
                        onPressed: () {
                          Navigator.pop(context);
                        },
                      ),
                      Spacer(), // Add space between back arrow and logo
                      Text(
                        'Logo',
                        style: GoogleFonts.poppins(
                          textStyle: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 50),
                Text(
                  'Join the Fastest Growing Listening Community',
                  style: GoogleFonts.poppins(
                    textStyle: TextStyle(
                      fontSize: 30,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  textAlign: TextAlign.center,
                ),
                SizedBox(height: 30),
                // Form fields for registration
                // Assuming you have form fields here for registration
                SizedBox(height: 20),
                // Center align the buttons
                Center(
                  child: Column(
                    children: [
                      SizedBox(
                        width: mediaQuery.size.width * 0.75,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: () {},
                          child: Text(
                            'Spotify',
                            style: TextStyle(
                              fontSize: 16, // Set font size to 16
                              fontWeight: FontWeight.bold, // Set font weight to semibold
                              color: Colors.black, // Set text color to black
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 30),
                      SizedBox(
                        width: mediaQuery.size.width * 0.75,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: () {},
                          child: Text(
                            'YouTube Music',
                            style: TextStyle(
                              fontSize: 16, // Set font size to 16
                              fontWeight: FontWeight.bold, // Set font weight to semibold
                              color: Colors.black, // Set text color to black
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 30),
                      SizedBox(
                        width: mediaQuery.size.width * 0.75,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: () {},
                          child: Text(
                            'Apple Music',
                            style: TextStyle(
                              fontSize: 16, // Set font size to 16
                              fontWeight: FontWeight.bold, // Set font weight to semibold
                              color: Colors.black, // Set text color to black
                            ),
                          ),
                        ),
                      ),
                      SizedBox(height: 30),
                      SizedBox(
                        width: mediaQuery.size.width * 0.75,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: () {},
                          child: Text(
                            'Other',
                            style: TextStyle(
                              fontSize: 16, // Set font size to 16
                              fontWeight: FontWeight.bold, // Set font weight to semibold
                              color: Colors.black, // Set text color to black
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => LoginScreen()),
                  );
                },
                child: Container(
                  padding: EdgeInsets.all(16),
                  color: Colors.transparent,
                  child: Center(
                    child: RichText(
                      text: TextSpan(
                        text: "Already have an account? ",
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.black,
                        ),
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Login',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
