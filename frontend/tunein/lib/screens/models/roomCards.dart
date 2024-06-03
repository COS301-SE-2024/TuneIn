import './room.dart';

class RoomCard {
  final String name;
  final String songName;
  final String artistName;
  final String description;
  final String? username;
  final String? userProfile;
  final String backgroundImage;
  final List<String> tags;
  final bool mine; // New field to control display

  RoomCard({
    required this.name,
    required this.songName,
    required this.artistName,
    required this.description,
    this.username,
    this.userProfile,
    required this.backgroundImage,
    required this.tags,
    required this.mine, // Initialize mine
  });

  // Constructor to create RoomCard from Room and mine flag
  RoomCard.fromRoom(Room Room, {required bool mine})
      : name = Room.name,
        songName = Room.songName,
        artistName = Room.artistName,
        description = Room.description,
        username = Room.username,
        userProfile = Room.userProfile,
        backgroundImage = Room.backgroundImage,
        tags = Room.tags,
        mine = mine;
}
