# from Jaden
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


## GET /room/{id}
input: id
output: RoomDto

Room Info:
-Room Name
-Song Name
-Artist Name
-Username
-Tags

# From Nerina

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


## Get Song Info (GET /room/{id}/songs/current)
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

# From Linda
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

