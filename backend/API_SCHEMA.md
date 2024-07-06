# All endpoints list
## Users
### `/users`
#### GET: gets profile info✅
no input
response: return UserDto
#### PUT or PATCH: edits profile info✅
input: UserDto
output: updated UserDto

### `/users/{username}`
#### GET: gets profile info for given username✅
no input
response: UserDto

### `/users/{username}/follow`
#### POST: follows the user with the username given✅
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/unfollow`
#### POST: unfollows the user with the username given✅
no input
response: code (2xx for success, 4xx for error)

# (Note: add stuff for friends later)

### `/users/rooms`
related to a user's own rooms
#### GET: get a user's rooms✅
no input
response: an array of RoomDto
#### POST: create a new room✅
input: partial RoomDto
response: final RoomDto for room (including new id)

### `/users/rooms/recent`
#### GET: get user's recent rooms✅
no input
response: an array of RoomDto

### `/users/rooms/foryou`
#### GET: get user's recommended rooms
no input
response: an array of RoomDto

### `/users/friends`
#### GET: get user's friends✅
no input
response: an array of UserDto

### `/users/followers`
#### GET: get list of followers✅
no input
response: an array of UserDto
### `/users/following`
#### GET: get list of people user is following✅
no input
response: an array of UserDto

## Rooms
### `/rooms`

### `/rooms/new`
#### GET: returns newly created public rooms✅
no input
response: an array of RoomDto

### `/rooms/{room_id}`
#### GET: returns info about a room✅
no input
response: RoomDto

#### PUT or PATCH: edits room info (only if it belongs to the user)✅
input: partial RoomDto
response: updated RoomDto

#### DELETE: deletes the room (only if it belongs to the user)
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/join`
#### POST: adds current user as a participant to the room✅
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/leave`
#### POST: remove current user as a participant to the room✅
no input
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/users`
#### GET: returns people currently (and previously in room)
query params
- active: boolean
response: array of UserDto

### `/rooms/{room_id}/songs`
#### GET: returns the queue
no input
response: array of SongInfoDto

#### DELETE: clears the queue (except for current song, if playing)
no input
response: (2xx for success, 4xx for error)

#### POST: add a song to queue
input: SongInfoDto
response: array of SongInfoDto (room queue)

### `/rooms/{room_id}/songs/current` 
#### GET: returns the current playing song
no input
response: SongInfoDto

#### DELETE: skips the current song
no input
response: SongInfoDto (updated with new song playing)

## Search
### `/search`
#### GET: combines results of both `/search/users` and `/search/rooms`✅
no input
response: return an array of mixed data types of UserDto and RoomDto

### `/search/rooms`
#### GET: gets a list of rooms that match given names
query params
- q: string to match room name
- creator: string to match creator name
response: return an array of RoomDto

### `/search/rooms/advanced`
#### GET: gets a list of rooms that match given params
query params
- q: string to match room name
- creator_username: string to match creator username
- creator_name: string to match creator profile name
- partipicant_count: number of minimum participants
- description: string 's' to find in desc
- is_temp
- is_priv
- is_scheduled
- start_date
- end_date
- lang
- explicit: boolean to match
- nsfw: boolean to match
- tags: string array to compare (if any match)
response: return an array of RoomDto

### `/search/rooms/history`
#### GET: returns a list of recently searched rooms (rooms discovered from search)
response: return an array of RoomDto

### `/search/users`
#### GET: gets a list of users that match given names
query params
- q: string to match username or profile name
response: return an array of UserDto

### `/search/users/advanced`
#### GET: gets a list of users that match given params
query params
- q: string to match username or profile name
- creator_username: string to match creator username
- creator_name: string to match creator profile name
- following: number of minimum following
- followers: number of minimum followers
response: return an array of UserDto

### `/search/users/history`
#### GET: returns a list of recently searched users (users discovered from search)
response: return an array of UserDto

# Data Transfer Objects (Dtos)

## UserDto (User Profile Info)
A object representing User Profile information.
```json
{
	profile_name : string,
	user_id : string,
	username : string,
	profile_picture_url : string,
	followers: {
		count: int,
		data: [UserDto]
	},
	following: {
		count: int,
		data: [UserDto]
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
	creator: UserDto,
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
	id: string,
	title: string,
	artists: [string],
	genres: [string],
	lyrics_url: string,
	duration: number,
	cover: string
}
```
