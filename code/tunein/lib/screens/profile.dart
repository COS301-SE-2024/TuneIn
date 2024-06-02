// ignore_for_file: prefer_const_constructors

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
// import 'package:google_fonts/google_fonts.dart';
import '/routes/routes.dart';

class ProfileScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final mediaQuery = MediaQuery.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Align(
          alignment: Alignment.centerRight,
          child: Text(
            "Settings",
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
        ),
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Text(
              "Profile",
              style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 20,
              ),
            ),
            SizedBox(
              height: 20,
            ),
            Stack(
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
            SizedBox(height: 10),
            Text("Jess Bailey",
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600)),
            Text("@jessbailey", style: TextStyle(fontWeight: FontWeight.w400)),
            SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Column(
                  children: [
                    Text("17",
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.w600)),
                    Text("Followers",
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w400))
                  ],
                ),
                SizedBox(
                  width: 60,
                ),
                Column(
                  children: [
                    Text("270",
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.w600)),
                    Text("Following",
                        style: TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w400))
                  ],
                ),
              ],
            ),
            SizedBox(height: 30),
            Text("instagram.com/jessbailey and 2 more links",
                style: TextStyle(fontWeight: FontWeight.w700)),
            SizedBox(height: 20),
            SizedBox(
              width: 155,
              height: 37,
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromRGBO(158, 171, 184, 1),
                    side: BorderSide.none,
                    shape: const StadiumBorder()),
                child: const Text("Edit",
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w600,
                    )),
              ),
            ),
            SizedBox(height: 20),
            NowPlaying(),
            SizedBox(height: 20),
            BioSection(
              content:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do ",
            ),
            SizedBox(height: 20),
            Padding(
              padding: const EdgeInsets.only(left: 32),
              child: Row(
                children: const [
                  Text(
                    "Favorite Genres",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                    textAlign: TextAlign.start,
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 20,
            ),
            Center(child: GenreList(items: const ["Pop", "Hip-Hop", "Jazz", "Classical", "Rock"])),
          ],
        ),
      ),
    );
  }
}

class GenreBubble extends StatelessWidget {
  final String text;

  const GenreBubble({super.key, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 5.0),
      padding: EdgeInsets.symmetric(horizontal: 16.0),
      decoration: BoxDecoration(
        color: Color.fromRGBO(232, 235, 242, 1),
        borderRadius: BorderRadius.circular(
            10), // Half of the height to create a stadium shape
      ),
      child: Center(
        // Center the text vertically and horizontally
        child: Text(
          text,
          style: TextStyle(
            color: Colors.black,
            fontWeight: FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}

class GenreList extends StatelessWidget {
  final List<String> items;

  const GenreList({Key? key, required this.items}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 32, // Set the height of the container
      child: ListView.builder(
        padding: EdgeInsets.only(left:27),
        scrollDirection: Axis.horizontal,
        itemCount: items.length,
        itemBuilder: (context, index) {
          return GenreBubble(text: items[index]);
        },
      ),
    );
  }
}

class BioSection extends StatelessWidget {
  final String content;

  const BioSection({
    super.key,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 32),
          child: Row(
            children: const [
              Text(
                "Bio",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.start,
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(left: 32),
          child: Row(
            children: [
              Expanded(
                child: Text(
                  content,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                  textAlign: TextAlign.start,
                  softWrap: true,
                  overflow: TextOverflow.visible,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class NowPlaying extends StatelessWidget {
  const NowPlaying({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 32),
          child: Row(
            children: const [
              Text(
                "Now Playing",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.start,
              ),
            ],
          ),
        ),
        SizedBox(height: 5),
        Padding(
          padding: const EdgeInsets.fromLTRB(32, 0, 32, 0),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Color.fromRGBO(247, 250, 252, 1),
              border: Border.all(color: Color.fromRGBO(209, 214, 232, 1)),
            ),
            child: Row(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Container(
                    width: 57,
                    height: 57,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: Color.fromRGBO(158, 171, 184, 1),
                    ),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: const [
                    Text(
                      "Don't Smile At Me",
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    SizedBox(height: 5),
                    Text(
                      "Billie Eilish",
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                  ],
                ),
                Spacer(), // Add Spacer here
                Padding(
                  padding: const EdgeInsets.only(
                      right: 16.0), // Add padding if needed
                  child: Text(
                    "3:05",
                    textAlign: TextAlign.end,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
