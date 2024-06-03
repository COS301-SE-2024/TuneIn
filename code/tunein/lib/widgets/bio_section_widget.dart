import 'package:flutter/material.dart';
import 'title_widget.dart';

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
        TitleWidget(title: "Bio", more: false),
        Padding(
          padding: const EdgeInsets.only(left: 32, right: 32),
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