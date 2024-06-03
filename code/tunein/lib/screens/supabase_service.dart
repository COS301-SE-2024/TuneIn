import 'package:supabase_flutter/supabase_flutter.dart';
import './models/room.dart';
import './models/friends.dart';

class SupabaseService {
  static String yourId = "ac34854d-8f9f-489d-aca3-d8a930b4b8b5";
  SupabaseService._(); // Private constructor to prevent instantiation

  static final SupabaseService _instance = SupabaseService._();

  static SupabaseService get instance => _instance;

  SupabaseClient get client => Supabase.instance.client;

  Future<List<Room>> _getRoomsFromResponse(dynamic response) async {
    final List<dynamic> data = response as List<dynamic>;

    List<Room> rooms = [];
    for (var json in data) {
      final roomCreatorId = json['room_creator'] as String;
      final creatorResponse = await client
          .from('user')
          .select('username, profile_picture')
          .eq('user_id', roomCreatorId)
          .single();

      final Room room = Room(
        name: json['name'] ?? 'Unknown',
        songName: "Save Your Tears",
        artistName: "The Weeknd",
        description: json['description'] ?? 'No description available',
        username:
            creatorResponse != null ? creatorResponse['username'] : 'Unknown',
        userProfile:
            creatorResponse != null ? creatorResponse['profile_picture'] : '',
        backgroundImage: json['playlist_photo'] ?? '',
        tags: List<String>.from(json['tags'] ?? []),
      );
      rooms.add(room);
    }

    return rooms;
  }

  Future<List<Room>> _getRooms(String table) async {
    final response = await client.from(table).select();
    return _getRoomsFromResponse(response);
  }

  Future<List<Room>> getMyRooms() async {
    final response =
        await client.from('room').select().eq('room_creator', yourId);
    return _getRoomsFromResponse(response);
  }

  Future<List<Room>> getRecentRooms() async {
    final response = await client.from('room').select().limit(10);
    return _getRoomsFromResponse(response);
  }

  Future<List<Room>> getPicksForYou() async {
    final response = await client.from('room').select().limit(10);
    return _getRoomsFromResponse(response);
  }

  Future<List<Friend>> _getFriendsFromResponse(dynamic response) async {
    final List<dynamic> data = response as List<dynamic>;
    return data.map((json) {
      return Friend(
        name: json['username'] ?? 'Unknown', // Handle null value for username
        profilePicture: json['profile_picture'] ??
            '', // Handle null value for profile_picture
      );
    }).toList();
  }

  Future<List<Friend>> getFriends() async {
    print('your getFriends Id: $yourId');
    final followeesResponse = await client
        .from('follows')
        .select('followee')
        .eq('follower', '$yourId');
    final List<dynamic> followees = followeesResponse;
    print('followees: $followees');
    if (followees.isEmpty) {
      return [];
    }

    final List<String> followeeIds =
        followees.map((json) => json['followee'] as String).toList();

    List<Friend> friends = [];
    for (String followeeId in followeeIds) {
      final userResponse = await client
          .from('user')
          .select('username, profile_picture')
          .eq('user_id', followeeId)
          .single();

      if (userResponse != null) {
        friends.add(Friend(
          name: userResponse['username'],
          profilePicture: userResponse['profile_picture'],
        ));
      }
    }
    return friends;
  }

  Future<List<Room>> getRooms() async {
    try {
      final List<Room> recentRooms = await getRecentRooms();
      final List<Room> picksForYou = await getPicksForYou();
      final List<Room> myRooms = await getMyRooms();
      return [...myRooms, ...recentRooms, ...picksForYou];
    } on PostgrestException catch (e) {
      rethrow; // Rethrow the exception for handling at a higher level
    }
  }
}
