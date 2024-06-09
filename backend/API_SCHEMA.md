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

# Data Transfer Objects (Dtos)

## UserProfileDto (User Profile Info)
A object representing User Profile information.
```json
{
	profile_name : string,
	user_id : string,
	username : string,
	profile_picture_url : string,
	followers: {
		count: int,
		data: [ProfileDto]
	},
	following: {
		count: int,
		data: [ProfileDto]
	},
	links: {
		count: int,
		data: [string]
	},
	bio : string,
	current_song: SongInfoDto,
	fav_genres: {
		count: int,
		data: [string]
	},
	fav_songs: {
		count: int,
		data: [SongInfoDto]
	},
	fav_rooms: {
		count: int,
		data: [RoomDto]
	},
	recent_rooms: {
		count: int,
		data: [RoomDto]
	}
}
```

## RoomDto (Room Info)
A object representing Room information.
```json
{
	creator: ProfileDto,
	room_id: string,
	partipicant_count: number,
	room_name: string,
	description: string,
	is_temporary: boolean,
	is_private: boolean,
	is_scheduled: boolean,
	start_date: DateTime,
	end_date: DateTime,
	language: string,
	has_explicit_content: boolean,
	has_nsfw_content: boolean,
	room_image: string,
	current_song: SongInfoDto,
	tags: [string]
}
```

## SongInfoDto (Song Info)
A object representing Song information.
```json
{
	title: string,
	artists: [string],
	cover: string,
	start_time: DateTime
}
```