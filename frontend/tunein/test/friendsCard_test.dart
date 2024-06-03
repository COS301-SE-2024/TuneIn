import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import '../lib/screens/models/friends.dart';
import '../lib/screens/dummyPages/profilePage.dart';
import '../lib/screens/widgets/friendCard.dart';

// Mock Friend object
class MockFriend extends Mock implements Friend {
  @override
  String name = 'John Doe';

  @override
  String profilePicture = 'https://example.com/profile.jpg';
}

void main() {
  late FriendCard friendCard;
  late Friend friend;

  setUp(() {
    friend = MockFriend();
    friendCard = FriendCard(friend: friend);
  });

  testWidgets('FriendCard should display friend details',
      (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: friendCard)));

    // Verify that the friend's name is displayed
    expect(find.text('John Doe'), findsOneWidget);

    // Verify that the friend's profile picture is displayed
    expect(find.byType(CircleAvatar), findsOneWidget);
    expect(
        find.byWidgetPredicate((widget) =>
            widget is CircleAvatar && widget.backgroundImage is NetworkImage),
        findsOneWidget);
  });

  testWidgets('Tapping on FriendCard navigates to profile page',
      (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: friendCard)));

    // Tap on the friend card
    await tester.tap(find.byType(GestureDetector));

    // Wait for navigation
    await tester.pumpAndSettle();

    // Verify that the ProfilePage is pushed to the navigation stack
    expect(find.byType(ProfilePage), findsOneWidget);

    // Verify that the ProfilePage receives the correct friend object
    expect(find.text('John Doe'), findsOneWidget);
    expect(
        find.byWidgetPredicate((widget) =>
            widget is CircleAvatar && widget.backgroundImage is NetworkImage),
        findsOneWidget);
  });
}
