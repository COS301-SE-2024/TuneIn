import 'package:flutter/material.dart';
import 'routes/routes.dart';
import 'screens/welcome.dart';
import 'screens/login_streaming.dart';
import 'screens/register_streaming.dart';
import 'screens/register_other.dart';
import 'screens/login_other.dart';
import 'screens/login.dart';
import 'screens/register.dart';
import 'screens/profile.dart';
import 'screens/edit_profile.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TuneIn',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/', // Set the initial route if needed
      routes: {
        // '/': (context) => WelcomePage(), // Set the default route
        '/': (context) => ProfileScreen(), // Register the profile route
        Routes.login: (context) => LoginScreen(), // Register the login route
        Routes.register: (context) => RegisterScreen(), // Register the register route
        Routes.registerOther: (context) => RegisterOtherScreen(), // Register the registerOther route
        Routes.loginOther: (context) => LoginOtherScreen(), // Register the loginOther route
        Routes.loginStreaming: (context) => LoginStreamingScreen(), // Register the loginStreaming route
        Routes.registerStreaming: (context) => RegisterStreamingScreen(), // Register the registerStreaming route
        Routes.profile: (context) => ProfileScreen(), 
        Routes.welcome: (context) => WelcomePage(), // Register the profile route
        Routes.editProfile: (context) => EditProfileScreen(), // Register the editProfile route
      },
      // Alternatively, you can use onGenerateRoute:
      // onGenerateRoute: Routes.generateRoute,
    );
  }
}

