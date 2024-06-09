# All endpoints list
## User Profiles
### `/profile`
#### GET: gets profile info
no input
response: return ProfileDto
#### PUT or PATCH: edits profile info
input: ProfileDto
output: updated ProfileDto

### `/profile/{username}`
#### GET: gets profile info for given username
no input
response: ProfileDto

### `/profile/{username}/follow`
#### POST: follows the user with the username given
no input
response: code (2xx for success, 4xx for error)

### `/profile/{username}/unfollow`
#### POST: unfollows the user with the username given
no input
response: code (2xx for success, 4xx for error)

(Note: add stuff for friends later)

## User (general for authenticated user)
### `/user`
#### GET: gets user info
no input
response: return UserDto
#### PUT or PATCH: edits profile info
input: UserDto
response: return updated UserDto

### `/user/rooms`
related to a user's own rooms
#### GET: get a user's rooms
no input
response: an array of RoomDto
#### POST: create a new room
input: partial RoomDto
response: final RoomDto for room (including new id)

### `/user/rooms/recent`
#### GET: get user's recent rooms
no input
response: an array of RoomDto

### `/user/rooms/foryou`
#### GET: get user's recommended rooms
no input
response: an array of RoomDto

### `/user/friends`
#### GET: get user's friends
no input
response: an array of ProfileDto

### `/user/followers`
#### GET: get list of followers
no input
response: an array of ProfileDto
### `/users/following`
#### GET: get list of people user is following
no input
response: an array of ProfileDto

## Rooms
### `/rooms`

### `/rooms/new`
#### GET: returns newly created public rooms
no input
response: an array of RoomDto

### `/rooms/{room_id}`
#### GET: returns info about a room
no input
response: RoomDto

#### PUT or PATCH: edits room info (only if it belongs to the user)
input: partial RoomDto
response: updated RoomDto

#### DELETE: deletes the room (only if it belongs to the user)
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/join`
#### POST: adds current user as a participant to the room
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/leave`
#### POST: remove current user as a participant to the room
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/users`
#### GET: returns people currently (and previously in room)
no input
response: array of ProfileDto

### `/rooms/{room_id}/songs` (not for demo 1)
#### GET: returns the queue
no input
response: array of SongInfoDto

#### DELETE: clears the queue (except for current song, if playing)
no input
response: (2xx for success, 4xx for error)

#### POST: add a song to queue
input: SongInfoDto
response: array of SongInfoDto (room queue)

### `/rooms/{room_id}/songs/current` (not for demo 1)
#### GET: returns the current playing song
no input
response: SongInfoDto

#### DELETE: skips the current song
no input
response: SongInfoDto (updated with new song playing)


# All endpoints (rough definition)
## /profile (for self) or /profile/{username} (for other users)

GET
Profile Page (UserProfileDto)
-Name
-Username
-Profile Picture
-No. of Followers
-No. of Following
-Social Media Links
-Bio
-Current song playing (probably only after we get music streaming sorted)
-Favorite Genres
-Favorite Songs
-Favorite Rooms
-Recently Visited Rooms

PUT or PATCH
input: UserProfileDto
output: response code

Edit Profile Page:
-Profile Picture
-Name
-Username
-Bio
-Social Media Links
-Favorite Genres
-Favorite Songs
- Favourite Rooms

## POST /user/rooms (create room)
input: RoomDto
output: full RoomDto (with id)
### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:**
  - `user_id` (required, they will be the owner of the room)
  - `room_id` (string, required): ID of the room
  - `name` (string, required): Name of the room
  - `type` (string, required): Room type, either permanent or temporary
  - `visibility` (string, required): Room visibility, either public or private
  - `schedule` (boolean, optional): Indicates if the room is scheduled for later

### Response
```json
[
{
  "room": {
    "id": "room_id",
    "name": "Room Name",
    "type": "permanent",
    "visibility": "public",
    "schedule": false,
  }
},
  ...
]
```

## Edit room details (PUT /rooms/{id})
input: id & RoomDto
output: response code
- **Query Parameters:**
  - `user_id` (required, they will be the owner of the room)
  - `room_id` (string, required): ID of the room
  - `name` (string, optional): Name of the room
  - `description` (string, optional): Description of the room
  - `language` (string, optional): Language of the room
  - `explicit` (boolean, optional): Indicates if the room contains explicit content
  - `nsfw` (boolean, optional): Indicates if the room is NSFW
  - `photo` (string, optional): URL of the photo for the room
## GET /rooms/{id}
input: id
output: RoomDto

Room Info:
-Room Name
-Song Name
-Artist Name
-Username
-Tags

## Get queue (GET /rooms/{id}/songs)
## Get Song Info (GET /rooms/{id}/songs/current)
### Description
This endpoint fetches the current song details being played in the room.

- **Query Parameters:**
  - `room_id` (string, required): ID of the room

### Response
```json
[
  {
    "song": {
	    "picture": "https://example.com/song_picture.jpg",
	    "name": "Song Name",
	    "artist": "Song Artist",
	    "current_position": "00:02:15"
	  }
  },
  ...
]
```

## Get Friends (GET /user/friends)
### Description
This endpoint returns a JSON array containing friends data personalized for the user.

- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

Returns array of ProfileDto

## My Rooms API Endpoint (GET /user/rooms)

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

Returns array of RoomDto
## Get Recent Rooms (GET /user/rooms/recent)
- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

### Response
```json
[
  {
    "backgroundImage": "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600",
    "name": "Chill Vibes",
    "description": "A description of the room goes here.",
    "userProfile": "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    "username": "User123",
    "tags": ["Tag1", "Tag2", "Tag3"]
  },
  ...
]
```

## Get Rooms for You (GET /users/rooms/foryou)

### Description
This endpoint returns a JSON array containing recommended rooms personalized for the user.

- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

Returns array of RoomDto

# Potentially for later
## Chat Messages

### Description
This endpoint manages the chat messages within a room, including fetching existing messages and sending new messages.

### Endpoint
- **URL:** `/api/room_chat`
- **Method:** `GET`, `POST`

### Request Parameters (GET)
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:(GET)** 
  - `room_id` (string, required): ID of the room

### Response (GET)
```json
[
  {
    "username": "User1",
    "profilePicture": "https://example.com/user1_profile.jpg",
    "message": "Hello everyone!",
    "timestamp": "2024-06-09T12:34:56Z"
  },
  {
    "username": "User2",
    "profilePicture": "https://example.com/user2_profile.jpg",
    "message": "Hi User1!",
    "timestamp": "2024-06-09T12:35:10Z"
  },
  ...
]
```



### Request Parameters (POST)
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:(POST)** 
  - `room_id` (string, required): ID of the room
  - `message` (string, required): The message to be sent

### Response (POST)
```json
[
{
"chat": {
    "username": "CurrentUser",
    "profilePicture": "https://example.com/current_user_profile.jpg",
    "message": "This is a new message!",
    "timestamp": "2024-06-09T12:36:45Z"
  },
}
  ...
]
```

