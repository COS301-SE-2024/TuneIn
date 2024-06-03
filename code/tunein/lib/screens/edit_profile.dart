import 'package:flutter/material.dart';
import '../models/user.dart';

class EditProfileScreen extends StatefulWidget {
  final UserProfile userProfile;
  final Function(UserProfile) onSave;

  const EditProfileScreen({Key? key, required this.userProfile, required this.onSave}) : super(key: key);

  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  late TextEditingController _nameController;
  late TextEditingController _usernameController;
  late TextEditingController _bioController;
  late TextEditingController _socialLinksController;
  late TextEditingController _genresController;
  late TextEditingController _favoriteSongsController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.userProfile.name);
    _usernameController = TextEditingController(text: widget.userProfile.username);
    _bioController = TextEditingController(text: widget.userProfile.bio);
    _socialLinksController = TextEditingController(text: widget.userProfile.socialLinks.join(", "));
    _genresController = TextEditingController(text: widget.userProfile.genres.join(", "));
    _favoriteSongsController = TextEditingController(text: widget.userProfile.favoriteSongs.join(", "));
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _bioController.dispose();
    _socialLinksController.dispose();
    _genresController.dispose();
    _favoriteSongsController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    final updatedProfile = UserProfile(
      name: _nameController.text,
      username: _usernameController.text,
      bio: _bioController.text,
      instagramLink: widget.userProfile.instagramLink,
      twitterLink: widget.userProfile.twitterLink,
      // socialLinks: _socialLinksController.text.split(", "),
      genres: _genresController.text.split(", "),
      favoriteSongs: _favoriteSongsController.text.split(", "),
    );
    widget.onSave(updatedProfile);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.cancel),
          onPressed: () {
            Navigator.of(context).pop(); // Handle cancel action
          },
        ),
        title: Text(
          'Edit Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          TextButton(
            onPressed: _saveProfile,
            child: Text('Save', style: TextStyle(color: Colors.grey)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(height: 20),
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 125,
                    height: 125,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Color.fromRGBO(158, 171, 184, 1),
                    ),
                  ),
                ],
              ),
            ),
            Positioned(
                    child: TextButton(
                      onPressed: () {
                        // Handle change photo action
                      },
                      child: Text('Change Photo'),
                    ),
                  ),
            SizedBox(height: 10),
            ListTile(
              title: Text(
                'Name',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(_nameController.text), // Replace with actual user name
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () {
                      _showEditDialog('Name', _nameController);
                    },
                  ),
                ],
              ),
            ),
            ListTile(
              title: Text(
                'Username',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('@${_usernameController.text}'), // Replace with actual username
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () {
                      _showEditDialog('Username', _usernameController);
                    },
                  ),
                ],
              ),
            ),
            ListTile(
              title: Text(
                'Bio',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              trailing: IconButton(
                icon: Icon(Icons.edit),
                onPressed: () {
                  _showEditDialog('Bio', _bioController, maxLines: 3);
                },
              ),
            ),
            Divider(height: 20, thickness: 1),
            ListTile(
              title: Text(
                'Social',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            ListTile(
              title: Text('Instagram'),
              subtitle: Text(_socialLinksController.text.split(', ').firstWhere((link) => link.contains('instagram'), orElse: () => '')), // Replace with actual Instagram link
              onTap: () {
                _showEditDialog('Instagram Link', _socialLinksController);
              },
            ),
            ListTile(
              title: Text('Twitter'),
              subtitle: Text(_socialLinksController.text.split(', ').firstWhere((link) => link.contains('twitter'), orElse: () => '')), // Replace with actual Twitter link
              onTap: () {
                _showEditDialog('Twitter Link', _socialLinksController);
              },
            ),
            Divider(height: 20, thickness: 1),
            ListTile(
              title: Text(
                'Genres',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _genresController.text.split(', ').map((genre) {
                  return Chip(
                    label: Text(genre),
                    onDeleted: () {
                      setState(() {
                        final genres = _genresController.text.split(', ').toList();
                        genres.remove(genre);
                        _genresController.text = genres.join(', ');
                      });
                    },
                  );
                }).toList()
                  // ..add(
// Chip(
//   label: Text('Add+'),
//   onPressed: () {
//     _showEditDialog('Genres', _genresController);
//   },
// )

                  // ),
              ),
            ),
            Divider(height: 20, thickness: 1),
            ListTile(
              title: Text(
                'Favorite Songs',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
            Column(
              children: _favoriteSongsController.text.split(', ').map((song) {
                return ListTile(
                  title: Text(song),
                );
              }).toList()
                ..add(
ListTile(
  title: Text('Add Song +'),
  onTap: () {
    _showEditDialog('Favorite Songs', _favoriteSongsController);
  },
)

                ),
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(String field, TextEditingController controller, {int maxLines = 1}) {
    final TextEditingController _dialogController = TextEditingController(text: controller.text);
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text('Edit $field'),
          content: TextField(
            controller: _dialogController,
            maxLines: maxLines,
          ),
          actions: [
            TextButton(
              onPressed: () {
                setState(() {
                  controller.text = _dialogController.text;
                });
                Navigator.of(context).pop();
              },
              child: Text('Save'),
            ),
          ],
        );
      },
    );
  }
}










// import 'package:flutter/material.dart';
// import '../models/user.dart';

// class EditProfileScreen extends StatefulWidget {
//   final UserProfile userProfile;
//   final Function(UserProfile) onSave;

//   const EditProfileScreen({Key? key, required this.userProfile, required this.onSave}) : super(key: key);

//   @override
//   _EditProfileScreenState createState() => _EditProfileScreenState();
// }

// class _EditProfileScreenState extends State<EditProfileScreen> {
//   late TextEditingController _nameController;
//   late TextEditingController _usernameController;
//   late TextEditingController _bioController;
//   late TextEditingController _socialLinksController;
//   late TextEditingController _genresController;
//   late TextEditingController _favoriteSongsController;

//   @override
//   void initState() {
//     super.initState();
//     _nameController = TextEditingController(text: widget.userProfile.name);
//     _usernameController = TextEditingController(text: widget.userProfile.username);
//     _bioController = TextEditingController(text: widget.userProfile.bio);
//     _socialLinksController = TextEditingController(text: widget.userProfile.socialLinks.join(", "));
//     _genresController = TextEditingController(text: widget.userProfile.genres.join(", "));
//     _favoriteSongsController = TextEditingController(text: widget.userProfile.favoriteSongs.join(", "));
//   }

//   @override
//   void dispose() {
//     _nameController.dispose();
//     _usernameController.dispose();
//     _bioController.dispose();
//     _socialLinksController.dispose();
//     _genresController.dispose();
//     _favoriteSongsController.dispose();
//     super.dispose();
//   }

//   void _saveProfile() {
//     final updatedProfile = UserProfile(
//       name: _nameController.text,
//       username: _usernameController.text,
//       bio: _bioController.text,
//       instagramLink: widget.userProfile.instagramLink,
//       twitterLink: widget.userProfile.twitterLink,
//       // socialLinks: _socialLinksController.text.split(", "),
//       genres: _genresController.text.split(", "),
//       favoriteSongs: _favoriteSongsController.text.split(", "),
//     );
//     widget.onSave(updatedProfile);
//     Navigator.of(context).pop();
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text("Edit Profile"),
//         actions: [
//           IconButton(
//             icon: Icon(Icons.save),
//             onPressed: _saveProfile,
//           ),
//         ],
//       ),
//       body: Padding(
//         padding: const EdgeInsets.all(16.0),
//         child: ListView(
//           children: [
//             TextField(
//               controller: _nameController,
//               decoration: InputDecoration(labelText: "Name"),
//             ),
//             TextField(
//               controller: _usernameController,
//               decoration: InputDecoration(labelText: "Username"),
//             ),
//             TextField(
//               controller: _bioController,
//               decoration: InputDecoration(labelText: "Bio"),
//               maxLines: 3,
//             ),
//             TextField(
//               controller: _socialLinksController,
//               decoration: InputDecoration(labelText: "Social Links (comma separated)"),
//             ),
//             TextField(
//               controller: _genresController,
//               decoration: InputDecoration(labelText: "Genres (comma separated)"),
//             ),
//             TextField(
//               controller: _favoriteSongsController,
//               decoration: InputDecoration(labelText: "Favorite Songs (comma separated)"),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
















// import 'package:flutter/material.dart';

// class EditProfileScreen extends StatelessWidget {
//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         leading: IconButton(
//           icon: Icon(Icons.cancel),
//           onPressed: () {
//             // Handle cancel action
//           },
//         ),
//         title: Text(
//           'Edit Profile',
//           style: TextStyle(fontWeight: FontWeight.bold),
//         ),
//         actions: [
//           TextButton(
//             onPressed: () {
//               // Handle save action
//             },
//             child: Text('Save', style: TextStyle(color: Colors.white)),
//           ),
//         ],
//       ),
//       body: SingleChildScrollView(
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.stretch,
//           children: [
//             SizedBox(height: 20),
//             Center(
//               child: Stack(
//                 children: [
//                   Container(
//                     width: 125,
//                     height: 125,
//                     decoration: BoxDecoration(
//                       shape: BoxShape.circle,
//                       color: Color.fromRGBO(158, 171, 184, 1),
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//             Positioned(
//               child: TextButton(
//                 onPressed: () {
//                   // Handle change photo action
//                 },
//                 child: Text('Change Photo'),
//               ),
//             ),
//             SizedBox(height: 10),
//             ListTile(
//               title: Text(
//                 'Name',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//               trailing: Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Text('User Name'), // Replace with actual user name
//                   IconButton(
//                     icon: Icon(Icons.edit),
//                     onPressed: () {
//                       // Handle edit name action
//                     },
//                   ),
//                 ],
//               ),
//             ),
//             ListTile(
//               title: Text(
//                 'Username',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//               trailing: Row(
//                 mainAxisSize: MainAxisSize.min,
//                 children: [
//                   Text('@username'), // Replace with actual username
//                   IconButton(
//                     icon: Icon(Icons.edit),
//                     onPressed: () {
//                       // Handle edit username action
//                     },
//                   ),
//                 ],
//               ),
//             ),
//             ListTile(
//               title: Text(
//                 'Bio',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//               trailing: IconButton(
//                 icon: Icon(Icons.edit),
//                 onPressed: () {
//                   // Handle edit bio action
//                 },
//               ),
//             ),
//             Divider(height: 20, thickness: 1),
//             ListTile(
//               title: Text(
//                 'Social',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//             ),
//             ListTile(
//               title: Text('Instagram'),
//               subtitle: Text('instagram.com/username'), // Replace with actual Instagram link
//               onTap: () {
//                 // Handle Instagram link tap
//               },
//             ),
//             ListTile(
//               title: Text('Twitter'),
//               subtitle: Text('twitter.com/username'), // Replace with actual Twitter link
//               onTap: () {
//                 // Handle Twitter link tap
//               },
//             ),
//             Divider(height: 20, thickness: 1),
//             ListTile(
//               title: Text(
//                 'Genres',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//             ),
//             Padding(
//               padding: const EdgeInsets.symmetric(horizontal: 20.0),
//               child: Wrap(
//                 spacing: 8,
//                 runSpacing: 8,
//                 children: [
//                   // List of genre bubbles with remove button
//                   // Example: GenreBubble(text: 'Pop', onClose: () {/* Handle remove genre action */}),
//                   // Add button
//                   OutlinedButton(
//                     onPressed: () {
//                       // Handle add genre action
//                     },
//                     child: Text('Add+'),
//                   ),
//                 ],
//               ),
//             ),
//             Divider(height: 20, thickness: 1),
//             ListTile(
//               title: Text(
//                 'Favorite Songs',
//                 style: TextStyle(fontWeight: FontWeight.bold),
//               ),
//             ),
//             // List of favorite songs from profile
//             // Example: ListTile(title: Text('Song Title'), subtitle: Text('Artist Name'))
//             // Add button
//             Padding(
//               padding: const EdgeInsets.symmetric(horizontal: 20.0),
//               child: OutlinedButton(
//                 onPressed: () {
//                   // Handle add song action
//                 },
//                 child: Text('Add Song +'),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }
