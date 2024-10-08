# All endpoints list
## Users
### `/users`
#### GET: gets profile info✅
no input
response: return UserDto
#### PUT or PATCH: edits profile info✅
input: UserDto
output: updated UserDto

### `/users/stats`
#### GET: gets user's listening stats
no input
response: return UserListeningStatsDto

### `/users/dms`
#### GET: gets the last DMs sent to or received from another user
response: return DirectMessageDto[]

### `/users/{username}`
#### GET: gets profile info for given username✅
no input
response: UserDto

### `/users/{username}/befriend`
#### POST: sends a friend request to user with given username
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/unfriend`
#### POST: ends friendship with user
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/accept`
#### POST: accepts friend request from user
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/reject`
#### POST: accepts user's friend request
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/block`
#### POST: blocks a given user
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/unblock`
#### POST: unblocks a given user
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/report`
#### POST: report a given user
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/follow`
#### POST: follows the user with the username given✅
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/unfollow`
#### POST: unfollows the user with the username given✅
no input
response: code (2xx for success, 4xx for error)

### `/users/{username}/chat`
#### GET: gets the chat history between self and given user✅
no input
response: DirectMessageDto[]

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

### `/users/rooms/current`
#### GET: get user's current room (room they're currently in)
response: RoomDto or null

### `/users/friends`
#### GET: get user's friends✅
no input
response: an array of UserDto

### `/users/friends/requests`
#### GET: get user's friend requests
no input
response: an array of UserDto (with friendship object attached)

### `/users/followers`
#### GET: get list of followers✅
no input
response: an array of UserDto
### `/users/following`
#### GET: get list of people user is following✅
no input
response: an array of UserDto

### `/users/blocked`
#### GET: get list of people user has blocked
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

#### DELETE: deletes the room (only if it belongs to the user)✅
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

### `/rooms/{room_id}/kicked`
#### GET: get list of kicked users
response: an array of UserDto
#### POST: kick someone out of a room
```
{
	userID: string;
}
```
response: (2xx for success, 4xx for error)
#### DELETE: undo participant kick
body: 
```
{
	userID: string;
}
```
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/banned`
#### GET: get list of banned users
response: an array of UserDto
#### POST: perma ban someone from a room
```
{
	userID: string;
}
```
response: (2xx for success, 4xx for error)
#### DELETE: undo participant ban
body: 
```
{
	userID: string;
}
```
response: (2xx for success, 4xx for error)

### `/rooms/{room_id}/save`
#### POST: save room as a playlist
response: `playlistID: string`

### `/rooms/{room_id}/users`
#### GET: returns people currently (and previously in room)
query params
- active: boolean
response: array of UserDto

### `/rooms/{room_id}/schedule`
#### GET: returns a .ics file for the scheduled room
response: a .ics file or 4xx for room that is not scheduled

### `/rooms/{room_id}/split`
#### GET: evaluate if a room can be split
response: an array of the possible genres (if possible) or 4xx if not possible
#### POST: returns a RoomDto with info about it's split children
response: the RoomDto

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

### `/rooms/{room_id}/analytics`

#### GET: returns all room analytics
no input
response: RoomAnalyticsDto
```json
{
	queue: RoomAnalyticsQueueDto,
	participation: RoomAnalyticsParticipationDto,
	interactions: RoomAnalyticsInteractionsDto,
	votes: RoomAnalyticsVotesDto,
	songs: RoomAnalyticsSongsDto,
	contributors: RoomAnalyticsContributorsDto,
}
```

### `/rooms/{room_id}/analytics/queue`
#### GET: returns 'queue' related analytics
no input
response: RoomAnalyticsQueueDto
```json
{
	total_songs_queued: number,
	total_songs_exported: number
}
```

### `/rooms/{room_id}/analytics/participation`
#### GET: returns 'participation' related analytics
no input
response: RoomAnalyticsParticipationDto

```json
{
	joins: {
		per_day: {
			total_joins: {
				count: number,
				day: Date,
			}[],
			unique_joins: {
				count: number,
				day: Date,
			}[],
		},
		all_time: {
			total_joins: number,
			unique_joins: number,
		},
	},
	participants_per_hour: {
		count: number,
		instance: Date,
	}[],
	session_data: {
		all_time: {
			avg_duration: number,
			min_duration: number,
			max_duration: number,
		},
		per_day: {
			avg_duration: {
				duration: number,
				day: Date,
			}[],
			min_duration: {
				duration: number,
				day: Date,
			}[],
			min_duration: {
				duration: number,
				day: Date,
			}[],
		},
	},
	return_visits: {
		expected_return_count: number,
		probability_of_return: number,
	},
	room_previews: number,
}
```

### `/rooms/{room_id}/analytics/interactions`
#### GET: returns interaction analytics
no input
response: RoomAnalyticsInteractionsDto
```json
{
	messages: {
		total: number,
		per_hour: {
			count: number,
			instance: Date,
		},
	},
	reactions_sent: number,
	bookmarked_count: number,
}
```

### `/rooms/{room_id}/analytics/votes
#### GET: returns voting analytics
no input
response: RoomAnalyticsVotesDto
```json
{
	total_upvotes: number,
	total_downvotes: number,
	daily_percentage_change_in_upvotes: number,
	daily_percentage_change_in_downvotes: number,
	songs: {
		spotify_id: string,
		song_id: string,
		plays: number,
		upvotes: number,
		downvotes: number,
		rank: number,
		global_rank: number,
	}[],
}
```

### `/rooms/{room_id}/analytics/songs
#### GET: returns song analytics
no input
response: RoomAnalyticsSongsDto
```json
{
	most_played: {
		spotify_id: string,
		song_id: string,
		plays: number,
		upvotes: number,
		downvotes: number,
		rank: number,
		global_rank: number,
	}[],
	top_voted: {
		spotify_id: string,
		song_id: string,
		plays: number,
		upvotes: number,
		downvotes: number,
		rank: number,
		global_rank: number,
	}[],
}
```

### `/rooms/{room_id}/analytics/contributors
#### GET: returns analytics related to room contributors
no input
response: RoomAnalyticsSongsDto
```json
{
	top_contributors: {
		user: UserDto,
		rank: number,
		num_songs: number,
		num_upvotes: number,
	}[],
}
```

## Search
### `/search`
#### GET: combines results of both `/search/users` and `/search/rooms`
no input
response: return an array of mixed data types of UserDto and RoomDto

### `/search/history`
#### GET: returns a list of recent searches & recent finds
response: return an array of either string (for previous search strings), RoomDto or UserDto (for previously found objects)
#### DELETE: clears all search history for user
response: (2xx for success, 4xx for error)

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
#### DELETE: clears all room search history for user
response: (2xx for success, 4xx for error)

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
#### DELETE: clears all user search history for user
response: (2xx for success, 4xx for error)

### `/search/genres`
#### GET: gets a list of genres that match given string
query params
- q: string to match genres
response: return an array of genre names (strings)

## Genres
### `/genres`
#### GET: gets a list of all genres in our db
response: return a string array of genre names

## Songs
### `/songs/{song_id}/spotify`
#### GET: gets the spotify id for a song with given id
input: song id as URL path param
response: {id: string}

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
	},
	friendship: {
		status: boolean,
		accept_url: string,
		reject_url: string,
		
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
	start_date: Date,
	end_date: Date,
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
