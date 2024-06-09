# from Jaden
Profile Page:
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

Room Info:
-Room Name
-Song Name
-Artist Name
-Username
-Tags

Edit Profile Page:
-Profile Picture
-Name
-Username
-Bio
-Social Media Links
-Favorite Genres
-Favorite Songs

# From Nerina
# Home API Endpoints

## Recent Rooms API Endpoint

### Description
This endpoint returns a JSON array containing data for recent rooms personalized for the user.

### Endpoint
- **URL:** `/api/recent_rooms`
- **Method:** `POST`

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

## Room Details API Endpoint

### Description
This endpoint allows the user to update the details of an existing room or create new room details.

### Endpoint
- **URL:** `/api/room_details`
- **Method:** `PUT`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:**
  - `user_id` (required, they will be the owner of the room)
  - `room_id` (string, required): ID of the room
  - `name` (string, optional): Name of the room
  - `description` (string, optional): Description of the room
  - `language` (string, optional): Language of the room
  - `explicit` (boolean, optional): Indicates if the room contains explicit content
  - `nsfw` (boolean, optional): Indicates if the room is NSFW
  - `photo` (string, optional): URL of the photo for the room


### Response
```json
[
  {
    "room": {
    "id": "room_id",
    "name": "Updated Room Name",
    "description": "Updated description of the room",
    "language": "Spanish",
    "explicit": true,
    "nsfw": true,
    "photo": "https://example.com/updated_photo.jpg"
  },
  ...
]
```

## Fetch Song Info API Endpoint

### Description
This endpoint fetches the current song details being played in the room.

### Endpoint
- **URL:** `/api/room_song_info`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
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

## Chat Messages API Endpoint

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
```-



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
```-



## User Profile Picture API Endpoint

### Description
This endpoint fetches the profile picture of the current user and displays it next to the input(message) text .

### Endpoint
- **URL:** `/api/user_profile_picture`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)

- **Query Parameters:**
  - `user_id` (required, they will be the person sending messages)

### Response
```json
{
  "profilePicture": "https://example.com/current_user_profile.jpg"
},
```

# From Linda
# Home API Endpoints

## Recent Rooms API Endpoint

### Description
This endpoint returns a JSON array containing data for recent rooms personalized for the user.

### Endpoint
- **URL:** `/api/recent_rooms`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
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

## Picks for You API Endpoint

### Description
This endpoint returns a JSON array containing recommended rooms personalized for the user.

### Endpoint
- **URL:** `/api/picks_for_you`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
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

## Friends API Endpoint

### Description
This endpoint returns a JSON array containing friends data personalized for the user.

### Endpoint
- **URL:** `/api/friends`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

### Response
```json
[
  {
    "profilePicture": "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    "name": "Friend 1"
  },
  {
    "profilePicture": "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    "name": "Friend 2"
  },
  ...
]
```

## My Rooms API Endpoint

### Description
This endpoint returns a JSON array containing data for rooms created by the user.

### Endpoint
- **URL:** `/api/my_rooms`
- **Method:** `GET`

### Request Parameters
- **Headers:**
  - `Authorization: Bearer <token>` (optional, if using token-based authentication)
  
- **Query Parameters:**
  - `user_id` (optional, if using user ID based identification)

### Response
```json
[
  {
    "backgroundImage": "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600",
    "name": "My Room 1",
    "description": "A description of my room goes here.",
    "userProfile": "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    "username": "User123",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "mine": true
  },
  {
    "backgroundImage": "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600",
    "name": "My Room 2",
    "description": "A description of my room goes here.",
    "userProfile": "https://cdn-icons-png.freepik.com/512/3135/3135715.png",
    "username": "User123",
    "tags": ["Tag1", "Tag2", "Tag3"],
    "mine": true
  },
  ...
]
```