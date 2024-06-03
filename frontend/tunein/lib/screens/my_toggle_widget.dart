// my_toggle_widget.dart
import 'package:flutter/material.dart';

class MyToggleWidget extends StatefulWidget {
  final String firstOption;
  final String secondOption;
  final Function(bool) onChanged;

  MyToggleWidget({
    required this.firstOption,
    required this.secondOption,
    required this.onChanged,
  });

  @override
  _MyToggleWidgetState createState() => _MyToggleWidgetState();
}

class _MyToggleWidgetState extends State<MyToggleWidget> {
  bool isFirstOptionSelected = true;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: MediaQuery.of(context).size.width * 0.9,
      height: 50,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        color: Color.fromRGBO(244, 244, 244, 1),
      ),
      padding: EdgeInsets.all(4),
      child: Row(
        children: <Widget>[
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  isFirstOptionSelected = true;
                });
                widget.onChanged(true);
              },
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: isFirstOptionSelected
                      ? [
                          BoxShadow(
                            color: Color.fromRGBO(0, 0, 0, 0.1),
                            offset: Offset(0, 0),
                            blurRadius: 4,
                          )
                        ]
                      : null,
                  color: isFirstOptionSelected
                      ? Color.fromRGBO(139, 143, 168, 1)
                      : Colors.transparent,
                ),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                child: Center(
                  child: Text(
                    widget.firstOption,
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: isFirstOptionSelected
                          ? Color.fromRGBO(255, 255, 255, 1)
                          : Color.fromRGBO(158, 158, 183, 1),
                      fontFamily: 'Poppins',
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: GestureDetector(
              onTap: () {
                setState(() {
                  isFirstOptionSelected = false;
                });
                widget.onChanged(false);
              },
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: !isFirstOptionSelected
                      ? [
                          BoxShadow(
                            color: Color.fromRGBO(0, 0, 0, 0.1),
                            offset: Offset(0, 0),
                            blurRadius: 4,
                          )
                        ]
                      : null,
                  color: !isFirstOptionSelected
                      ? Color.fromRGBO(139, 143, 168, 1)
                      : Colors.transparent,
                ),
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                child: Center(
                  child: Text(
                    widget.secondOption,
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: !isFirstOptionSelected
                          ? Color.fromRGBO(255, 255, 255, 1)
                          : Color.fromRGBO(158, 158, 183, 1),
                      fontFamily: 'Poppins',
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                      height: 1.5,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
