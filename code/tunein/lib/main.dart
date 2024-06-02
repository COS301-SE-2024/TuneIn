import 'package:flutter/material.dart';
import 'routes/routes.dart';
import 'screens/welcome.dart';
import 'screens/login_streaming.dart';
import 'screens/register_streaming.dart';
import 'screens/register_other.dart';
import 'screens/login_other.dart';
import 'screens/login.dart';
import 'screens/register.dart';
import 'screens/home.dart'; // Import HomePage

import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://fhedmgsybptxgzjkaifd.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoZWRtZ3N5YnB0eGd6amthaWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTcxODUyMDMsImV4cCI6MjAzMjc2MTIwM30.N7Rj-vT-GTCcQ69Kq-kVGy7_iiTciUpbTaF3J2jKJVg',
  );

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'TuneIn',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      initialRoute: '/', // Set the initial route if needed
      routes: {
        '/': (context) => WelcomePage(), // Set the default route
        Routes.login: (context) => LoginScreen(), // Register the login route
        Routes.register: (context) =>
            RegisterScreen(), // Register the register route
        Routes.registerOther: (context) =>
            RegisterOtherScreen(), // Register the registerOther route
        Routes.loginOther: (context) =>
            LoginOtherScreen(), // Register the loginOther route
        Routes.loginStreaming: (context) =>
            LoginStreamingScreen(), // Register the loginStreaming route
        Routes.registerStreaming: (context) =>
            RegisterStreamingScreen(), // Register the registerStreaming route
        '/home': (context) => HomePage(), // Register the home route
      },
    );
  }
}
