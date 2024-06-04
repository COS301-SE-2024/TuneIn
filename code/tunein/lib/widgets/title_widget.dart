import 'package:flutter/material.dart';

class TitleWidget extends StatelessWidget {
  final String title;
  final bool more;

  const TitleWidget({Key? key, required this.title, required this.more})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.only(
          left: 32, right: 32), // Adjust padding as needed
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.start,
          ),
          if (more)
            GestureDetector(
              onTap: () {
                // Add your onPressed logic here
              },
              child: Container(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  'More',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}