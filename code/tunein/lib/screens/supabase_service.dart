import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseService {
  static String yourId = "ac34854d-8f9f-489d-aca3-d8a930b4b8b5";
  SupabaseService._(); // Private constructor to prevent instantiation

  static final SupabaseService _instance = SupabaseService._();

  static SupabaseService get instance => _instance;

  SupabaseClient get client => Supabase.instance.client;

  Future<String> fetchProfilePictureUrl(String username) async {
    final response = await client
        .from('user')
        .select('profile_picture')
        .eq('username', username)
        .single(); // Ensure .execute() is called

    if (response['error'] != null) {
      throw Exception(
          'Failed to fetch profile picture: ${response['error']!.message}');
    }

    final data = response['data'] as Map<String, dynamic>;
    final profilePictureUrl = data['profile_picture'];
    return profilePictureUrl;
  }

  Future<Map<String, dynamic>>getProfileInfo(userID) async {


      final userResponse = await client
          .from('user')
          .select('username, bio, profile_picture')
          .eq('user_id', userID)
          .single();
      // if (userResponse != null) {
      //   friends.add(Friend(
      //     name: userResponse['username'],
      //     profilePicture: userResponse['profile_picture'],
      //   ));
      // }

    return userResponse;
  }

   Future<void> changeProfileInfo(userID, field, change) async {


      final userResponse = await client
          .from('user').update({field: change}).eq('user_id', userID);
      // if (userResponse != null) {
      //   friends.add(Friend(
      //     name: userResponse['username'],
      //     profilePicture: userResponse['profile_picture'],
      //   ));
      // }

    return userResponse;
  }
}
