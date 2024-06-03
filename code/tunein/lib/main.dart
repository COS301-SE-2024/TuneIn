import 'package:flutter/material.dart';
import 'routes/routes.dart';
import 'screens/welcome.dart';
import 'screens/login_streaming.dart';
import 'screens/register_streaming.dart';
import 'screens/register_other.dart';
import 'screens/login_other.dart';
import 'screens/login.dart';
import 'screens/register.dart';
import 'screens/home.dart';
import 'screens/profile.dart'; // Import ProfilePage

import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://fhedmgsybptxgzjkaifd.supabase.co',
    anonKey: 'your-anon-key',
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
        '/home': (context) => MainPage(), // Use MainPage with navigation bar
      },
    );
  }
}

class MainPage extends StatefulWidget {
  const MainPage({Key? key}) : super(key: key);

  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    HomePage(), // Your HomePage widget
    ProfilePage(), // Your ProfilePage widget
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.blue,
        onTap: _onItemTapped,
      ),
    );
  }
}
