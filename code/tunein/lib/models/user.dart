class UserProfile {
  String name;
  String username;
  String bio;
  final List<String> socialLinks;
  final String instagramLink;
  final String twitterLink;
  final List<String> genres;
  final List<String> favoriteSongs;

  UserProfile({
    required this.name,
    required this.username,
    required this.bio,
    required this.instagramLink,
    required this.twitterLink,
    required this.genres,
    required this.favoriteSongs,
  }) : socialLinks = [instagramLink, twitterLink]; // Define socialLinks here

  // Other methods and properties if needed
}

UserProfile userProfile = UserProfile(
  name: 'Jess Bailey',
  username: 'jessbailey',
  bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do',
  instagramLink: 'instagram.com/jessbailey',
  twitterLink: 'twitter.com/jessbailey',
  genres: ['Pop', 'Hip-Hop', 'Jazz', 'Classical', 'Rock'],
  favoriteSongs: ['Don\'t Smile At Me - Billie Eilish', 'Shape of You - Ed Sheeran'],
);
