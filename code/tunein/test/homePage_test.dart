import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/mockito.dart';
import '../lib/screens/home.dart';
import '../lib/screens/models/room.dart';
import '../lib/screens/models/friends.dart';
import '../lib/screens/widgets/roomCardsWidget.dart';
import '../lib/screens/widgets/friendCard.dart';
import '../lib/screens/dummyPages/roomPage.dart';
import '../lib/screens/dummyPages/createRoomPage.dart';
import '../lib/screens/dummyPages/friendsPage.dart';
import '../lib/screens/Supabase_service.dart';

// Mock SupabaseService
class MockSupabaseService extends Mock implements SupabaseService {}

void main() {
  late MockSupabaseService supabaseService;

  setUp(() {
    supabaseService = MockSupabaseService();
  });

  group('HomePage Widget Tests', () {
    testWidgets('Should show CircularProgressIndicator when waiting for data',
        (WidgetTester tester) async {
      when(supabaseService.getMyRooms()).thenAnswer((_) async => []);
      when(supabaseService.getRecentRooms()).thenAnswer((_) async => []);
      when(supabaseService.getPicksForYou()).thenAnswer((_) async => []);
      when(supabaseService.getFriends()).thenAnswer((_) async => []);

      await tester.pumpWidget(MaterialApp(home: HomePage()));

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('Should show error message when data fetch fails',
        (WidgetTester tester) async {
      when(supabaseService.getMyRooms()).thenThrow(Exception());
      when(supabaseService.getRecentRooms()).thenThrow(Exception());
      when(supabaseService.getPicksForYou()).thenThrow(Exception());
      when(supabaseService.getFriends()).thenThrow(Exception());

      await tester.pumpWidget(MaterialApp(home: HomePage()));

      expect(find.text('Error: Exception'), findsOneWidget);
    });

    testWidgets('Should show room cards when data is fetched',
        (WidgetTester tester) async {
      final myRooms = [
        Room(
          name: 'Room 1',
          songName: 'Song 1',
          artistName: 'Artist 1',
          description: 'Description 1',
          username: 'User 1',
          userProfile: 'Profile 1',
          backgroundImage: 'Background Image 1',
          tags: ['Tag 1', 'Tag 2'],
        )
      ];
      final recentRooms = [
        Room(
          name: 'Room 2',
          songName: 'Song 2',
          artistName: 'Artist 2',
          description: 'Description 2',
          username: 'User 2',
          userProfile: 'Profile 2',
          backgroundImage: 'Background Image 2',
          tags: ['Tag 3', 'Tag 4'],
        )
      ];
      final picksForYou = [
        Room(
          name: 'Room 3',
          songName: 'Song 3',
          artistName: 'Artist 3',
          description: 'Description 3',
          username: 'User 3',
          userProfile: 'Profile 3',
          backgroundImage: 'Background Image 3',
          tags: ['Tag 5', 'Tag 6'],
        )
      ];
      final friends = [
        Friend(
          name: 'Friend 1',
          profilePicture: '',
        )
      ];

      when(supabaseService.getMyRooms()).thenAnswer((_) async => myRooms);
      when(supabaseService.getRecentRooms())
          .thenAnswer((_) async => recentRooms);
      when(supabaseService.getPicksForYou())
          .thenAnswer((_) async => picksForYou);
      when(supabaseService.getFriends()).thenAnswer((_) async => friends);

      await tester.pumpWidget(MaterialApp(home: HomePage()));

      expect(find.byType(RoomCardWidget), findsNWidgets(3));
    });

    // Add more tests as needed for different scenarios
  });
}
