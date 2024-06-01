import 'package:flutter/material.dart';
// import 'package:flutter/widgets.dart';
import '../screens/welcome.dart';
import '../screens/login_streaming.dart';
import '../screens/register_streaming.dart';
import '../screens/register_other.dart';
import '../screens/login_other.dart';
import '../screens/login.dart';
import '../screens/register.dart';
import '../screens/chat_room.dart';

class Routes {
  static const String welcome = '/welcome';
  static const String login = '/login';
  static const String loginStreaming = '/loginStreaming';
  static const String register = '/register';
  static const String registerStreaming = '/registerStreaming';
  static const String registerOther = '/registerOther';  // Add the new route
  static const String loginOther = '/loginOther'; 
  static const String chatRoom = '/chatRoom';

  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case welcome:
        return MaterialPageRoute(builder: (_) => WelcomePage());
      case login:
        return MaterialPageRoute(builder: (_) => LoginScreen());
      case register:
        return MaterialPageRoute(builder: (_) => RegisterScreen());
      case registerOther: // Handle the new route
        return MaterialPageRoute(builder: (_) => RegisterOtherScreen());
      case loginOther: // Handle the new route
        return MaterialPageRoute(builder: (_) => LoginOtherScreen());
      case loginStreaming:
        return MaterialPageRoute(builder: (_) => LoginStreamingScreen());
      case registerStreaming:
        return MaterialPageRoute(builder: (_) => RegisterStreamingScreen());
      case chatRoom:
        return MaterialPageRoute(builder: (_) => ChatRoomScreen());
      default:
        return MaterialPageRoute(builder: (_) => Scaffold(body: Center(child: Text('No route defined for ${settings.name}'))));
    }
  }
}
