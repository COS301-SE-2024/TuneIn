# Functional Requirements

Below is a list of functional requirements that our team has identified for the TuneIn project.

#### FR1: User Registration & Authentication

##### FR1.1: User Sign-Up

- **FR1.1.1**: Users should be able to create an account using:
  - **FR1.1.1.1**: Their preferred streaming service account
    - **FR1.1.1.1.1**: Spotify
    - **FR1.1.1.1.1**: Apple Music
    - **FR1.1.1.1.1**: YouTube Music
  - **FR1.1.1.2**: Social media accounts
    - **FR1.1.1.2.1**: Google
    - **FR1.1.1.2.2**: Instagram
    - **FR1.1.1.2.3**: Facebook
    - **FR1.1.1.2.4**: X/Twitter
  - **FR1.1.1.3**: Email address
  - **FR1.1.1.4**: Mobile number

##### FR1.2: User Login

- **FR1.2.1**: Users should be able to log in using:
  - **FR1.2.1.1**: Streaming service accounts
  - **FR1.2.1.2**: Social media accounts
  - **FR1.2.1.3**: Login credentials (username and password)

##### FR1.3: Password Management

- **FR1.3.1**: Users should be able to reset their passwords via email.

##### FR1.4: Two-factor Authentication

- **FR1.4.1**: Users should be able to protect their login credentials with 2FA for enhanced security.

#### FR2: User Profiles

##### FR2.1: Profile Creation and Management

- **FR2.1.1**: Users should be able to create and update their profiles.
- **FR2.1.2**: Users should be able to add a profile picture.
- **FR2.1.3**: Users should be able to write a bio.
- **FR2.1.4**: Users should be able to specify favorite genres.
- **FR2.1.5**: Users should be able to see rooms recently visited.
- **FR2.1.6**: Users should be able to bookmark favorite rooms.
- **FR2.1.7**: Users should be able to list favorite songs.
- **FR2.1.8**: Users should be able to link to other profiles.
- **FR2.1.9**: Users should be able to display the song currently playing.

##### FR2.2: Music Preferences

- **FR2.2.1**: Users should be able to import favorite artists, genres, and songs from their streaming service.
- **FR2.2.2**: Users should be able to manually specify favorite artists, genres, and songs.
- **FR2.2.3**: Users should be able to use this information for music recommendations.

#### FR3: Interactive Sessions/Rooms

##### FR3.1: Room Creation

- **FR3.1.1**: Users should be able to create rooms that are:
  - **FR3.1.1.1**: Permanent or temporary
  - **FR3.1.1.2**: Public or private
  - **FR3.1.1.3**: Scheduled

##### FR3.2: Room Settings

- **FR3.2.1**: Users should be able to configure room settings, including:
  - **FR3.2.1.1**: Room name
  - **FR3.2.1.2**: Description
  - **FR3.2.1.3**: Genre
  - **FR3.2.1.4**: Language
  - **FR3.2.1.5**: Explicitness
  - **FR3.2.1.6**: NSFW
  - **FR3.2.1.7**: Playlist photo
  - **FR3.2.1.8**: Visibility/privacy
    - **FR3.2.1.8.1**: Public or private
    - **FR3.2.1.8.2**: Searchable or accessed by link
    - **FR3.2.1.8.3**: Limited to close friends
  - **FR3.2.1.9**: Room size
  - **FR3.2.1.10**: Listener permissions
  - **FR3.2.1.11**: Voice chat enabling
  - **FR3.2.1.12**: Timeout with no playback

##### FR3.3: Room Management

- **FR3.3.1**: Room owners should be able to manage participants.
- **FR3.3.2**: Room owners should be able to moderate content.
- **FR3.3.3**: Room owners should be able to delete the room.

##### FR3.4: Room Archival

- **FR3.4.1**: Users should be able to bookmark a room.
- **FR3.4.2**: Users should be able to save its songs as a playlist for future access.

##### FR3.5: Room Interaction

- **FR3.5.1**: Users should be able to enter and exit rooms.
- **FR3.5.2**: Users should be able to participate and vote in rooms.
- **FR3.5.3**: Users should be able to chat or voice chat in rooms.
- **FR3.5.4**: Users should be able to direct message other users in rooms (if allowed by settings).

#### FR4: Music Playback and Queue Management

##### FR4.1: Music Playback

- **FR4.1.1**: Users should be able to play, pause, and skip tracks within a room.
- **FR4.1.2**: Users should be able to experience real-time and synchronized playback across rooms.

##### FR4.2: Queue/Playlist Management

- **FR4.2.1**: Users should be able to add songs to the queue/playlist.
- **FR4.2.2**: Users should be able to see real-time updates to the queue/playlist.

##### FR4.3: Voting System

- **FR4.3.1**: Users should be able to vote on the next song to be played from the queue.

##### FR4.4: Library Integration

- **FR4.4.1**: Users should be able to add music to their streaming service library during playback.
- **FR4.4.2**: Users should be able to reference songs from their library for queuing.

#### FR5: Social Interaction

##### FR5.1: Chat Functionality

- **FR5.1.1**: Users should be able to send text messages.
- **FR5.1.2**: Users should be able to send emojis/emoticons.
- **FR5.1.3**: Users should be able to send reactions in real-time within a room.

##### FR5.2: Voice Chat

- **FR5.2.1**: Users should be able to engage in voice chat within a room.

##### FR5.3: Friendship/Following

- **FR5.3.1**: Users should be able to follow or befriend other users.
- **FR5.3.2**: Users should be able to receive updates on their activities.
- **FR5.3.3**: Users should be able to specify close friends who may see more detailed information about them and their rooms.

##### FR5.4: User Activity Feed

- **FR5.4.1**: Users should be able to see a feed of recent activities from friends and followed users, such as:
  - **FR5.4.1.1**: Room joins
  - **FR5.4.1.2**: Playlist updates
  - **FR5.4.1.3**: New friend connections

#### FR6: Music Discovery and Recommendations

##### FR6.1: Room Recommendations

- **FR6.1.1**: The system should recommend rooms based on:
  - **FR6.1.1.1**: User's music preferences
  - **FR6.1.1.2**: Current listening trends
  - **FR6.1.1.3**: Currently listened to song
  - **FR6.1.1.4**: Music mood
  - **FR6.1.1.5**: Permanent rooms must recommend music continuously

##### FR6.2: User Recommendations

- **FR6.2.1**: The system should recommend other users to follow based on similar music tastes.

##### FR6.3: Music Suggestions

- **FR6.3.1**: Rooms should suggest new songs or artists based on the music being played.

#### FR7: Collaborative Playlists

##### FR7.1: Playlist Creation

- **FR7.1.1**: Users should be able to create and manage collaborative playlists within a room.

##### FR7.2: Playlist Sharing

- **FR7.2.1**: Users should be able to share playlists with other users.
- **FR7.2.2**: Users should be able to export playlists to their personal music accounts on platforms like Spotify.

#### FR8: Integration with Music Services

##### FR8.1: API Integration

- **FR8.1.1**: The app should integrate with popular music streaming services (e.g., Spotify, YouTube Music) to:
  - **FR8.1.1.1**: Fetch and play music
  - **FR8.1.1.2**: Synchronize libraries

##### FR8.2: Playlist Synchronization

- **FR8.2.1**: Users should be able to save collaborative playlists to their accounts on these services.

#### FR9: Virtual Concerts

##### FR9.1: Live Streaming

- **FR9.1.1**: Users should be able to host and participate in virtual concerts within the app.

##### FR9.2: Concert Management

- **FR9.2.1**: Hosts should be able to manage concert details, including:
  - **FR9.2.1.1**: Schedule
  - **FR9.2.1.2**: Participants

#### FR10: Lyrics

##### FR10.1: Lyrics Display

- **FR10.1.1**: The app should display lyrics for the currently playing song using APIs from services like Last.fm or Musixmatch.

#### FR11: Notification System

##### FR11.1: Real-Time Notifications

- **FR11.1.1**: Users should receive real-time notifications (should they opt-in) for:
  - **FR11.1.1.1**: Room invitations
  - **FR11.1.1.2**: Song recommendations
  - **FR11.1.1.3**: Friend requests
  - **FR11.1.1.4**: Room recommendations
  - **FR11.1.1.5**: Trending rooms
  - **FR11.1.1.6**: Live rooms by artists/curators
  - **FR11.1.1.7**: Other activities

#### FR12: Music Analytics and Insights

##### FR12.1: Listening Stats

- **FR12.1.1**: Users should have access to statistics about their listening habits, such as:
  - **FR12.1.1.1**: Total listening time
  - **FR12.1.1.2**: Most played songs
  - **FR12.1.1.3**: Genres
  - **FR12.1.1.4**: Artists

##### FR12.2: Room Analytics

- **FR12.2.1**: Room creators should be able to see analytics for their rooms, including:
  - **FR12.2.1.1**: Number of participants
  - **FR12.2.1.2**: Most voted songs
  - **FR12.2.1.3**: Activity levels

#### FR13: Content Moderation

##### FR13.1: Automated Moderation

- **FR13.1.1**: Implement automated moderation tools to filter out inappropriate content in:
  - **FR13.1.1.1**: Chat messages
  - **FR13.1.1.2**: User profiles

##### FR13.2: Report and Block

- **FR13.2.1**: Users should be able to report inappropriate behavior.
- **FR13.2.2**: Users should be able to block other users.

#### FR14: Event Calendar and Scheduling

##### FR14.1: Event Scheduling

- **FR14.1.1**: Users should be able to schedule events such as:
  - **FR14.1.1.1**: Virtual concerts
  - **FR14.1.1.2**: Listening parties
  - **FR14.1.1.3**: DJ sessions within the app

##### FR14.2: Calendar Integration

- **FR14.2.1**: Integrate with calendar apps (e.g., Google Calendar) to add reminders for upcoming events.

#### FR15: Advanced Search and Filters

##### FR15.1: Search Functionality

- **FR15.1.1**: Users should be able to search for:
  - **FR15.1.1.1**: Rooms
  - **FR15.1.1.2**: Users
  - **FR15.1.1.3**: Songs using advanced filters like genre, mood, popularity, and activity level

##### FR15.2: Saved Searches

- **FR15.2.1**: Allow users to save their search queries for quick access later.

#### FR16: Security and Privacy

##### FR16.1: Data Encryption

- **FR16.1.1**: All sensitive user data should be encrypted.

##### FR16.2: Access Control

- **FR16.2.1**: Implement role-based access control for managing room permissions and administrative tasks.

##### FR16.3: Privacy Settings

- **FR16.3.1**: Users should be able to configure their privacy settings, including:
  - **FR16.3.1.1**: Profile visibility
  - **FR16.3.1.2**: Data sharing preferences

##### FR16.4: Data Policies

- **FR16.4.1**: Users should be able to request data stored about them for download.
- **FR16.4.2**: Users should be able to request for data to be deleted.

#### FR17: Accessibility, Usability, and Performance

##### FR17.1: Responsive Design

- **FR17.1.1**: The app should be fully responsive and usable on various devices and screen sizes.

##### FR17.2: Language Translation

- **FR17.2.1**: The app should be available in various LLM-powered language translations for a better user experience.

##### FR17.3: Accessibility Features

- **FR17.3.1**: Ensure the app is accessible to users with disabilities by implementing features like:
  - **FR17.3.1.1**: Screen reader support
  - **FR17.3.1.2**: High contrast modes
  - **FR17.3.1.3**: Keyboard navigation

##### FR17.4: Responsiveness

- **FR17.4.1**: The app should be optimized for fast loading times and smooth performance across all devices and network conditions.