import 'package:flutter/material.dart';
import 'routes/routes.dart';
import 'screens/welcome.dart';
import 'screens/login_streaming.dart';
import 'screens/register_streaming.dart';
import 'screens/register_other.dart';
import 'screens/login_other.dart';
import 'screens/login.dart';
import 'screens/register.dart';
<<<<<<< HEAD
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );
=======
import 'screens/profile.dart';
import 'screens/edit_profile.dart';
import 'models/user.dart'; // Import UserProfile model
// import 'package:flutter_dotenv/flutter_dotenv.dart';
// import 'package:supabase_flutter/supabase_flutter.dart';


void main() async {
  // await Supabase.initialize(
  //   url: dotenv.env['SUPABASE_URL']!,
  //   anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  // );
>>>>>>> feature/profile
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
      initialRoute: Routes.welcome, // Set the initial route if needed
      routes: {
        '/': (context) => ProfileScreen(userProfile: userProfile),
        Routes.welcome: (context) => WelcomePage(), // Set the default route
        Routes.login: (context) => LoginScreen(), // Register the login route
        Routes.register: (context) => RegisterScreen(), // Register the register route
        Routes.registerOther: (context) => RegisterOtherScreen(), // Register the registerOther route
        Routes.loginOther: (context) => LoginOtherScreen(), // Register the loginOther route
        Routes.loginStreaming: (context) => LoginStreamingScreen(), // Register the loginStreaming route
        Routes.registerStreaming: (context) => RegisterStreamingScreen(), // Register the registerStreaming route
        Routes.profile: (context) => ProfileScreen(userProfile: userProfile), // Register the profile route
        Routes.editProfile: (context) => EditProfileScreen(
          userProfile: userProfile,
          onSave: (UserProfile updatedProfile) {
            // Handle save action here
            // For example, you might want to update the userProfile object
            // with the changes made in the EditProfileScreen
            userProfile = updatedProfile;
          }
        ), // Register the editProfile route
      },
      // Alternatively, you can use onGenerateRoute:
      // onGenerateRoute: Routes.generateRoute,
    );
  }
}
