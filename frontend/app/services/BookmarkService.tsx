import { CognitoUserPool } from "amazon-cognito-identity-js";
import { RoomDto, RoomsApi, UsersApi } from "../../api";
import { RequiredError } from "../../api/base";

class BookmarkService {
	private static instance: BookmarkService;

	public static getInstance(): BookmarkService {
		if (!BookmarkService.instance) {
			BookmarkService.instance = new BookmarkService();
		}
		return BookmarkService.instance;
	}

	getBookmarks = async (users: UsersApi): Promise<RoomDto[]> => {
		let result: RoomDto[] = [];
		try {
			const response = await users.getBookmarks();
			if (response.status === 200) {
				//Created
				//Room bookmarked successfully
				console.log("Bookmarks withing body: ", result);
				return response.data;
			} else if (response.status === 401) {
				//Unauthorized
				//Auth header is either missing or invalid
				throw new Error("Cannot bookmark room for unauthorized user");
			} else if (response.status === 404) {
				//Not Found
				//Room not found
				throw new Error("Cannot bookmark room that does not exist");
			} else if (response.status === 500) {
				//Internal Server Error
				//Something went wrong in the backend (unlikely lmao)
				throw new Error("Internal server error");
			} else {
				throw new Error("Unknown error");
			}
		} catch (error) {
			if (error instanceof RequiredError) {
				// a required field is missing
			} else {
				// some other error
			}
		}
		console.log("Bookmarks outside body: ", result);
		return result;
	};

	bookmarkRoom = async (rooms: RoomsApi, roomID: string): Promise<void> => {
		// make a request to the backend to check if the room is bookmarked
		rooms
			.bookmarkRoom(roomID)
			.then((response) => {
				console.log("bookmarkRoom response: " + response);
				if (response.status === 201) {
					//Created
					//Room bookmarked successfully
					console.log("Room bookmarked successfully");
				} else if (response.status === 401) {
					//Unauthorized
					//Auth header is either missing or invalid
					throw new Error("Cannot bookmark room for unauthorized user");
				} else if (response.status === 404) {
					//Not Found
					//Room not found
					throw new Error("Cannot bookmark room that does not exist");
				} else if (response.status === 500) {
					//Internal Server Error
					//Something went wrong in the backend (unlikely lmao)
					throw new Error("Internal server error");
				} else {
					throw new Error("Unknown error");
				}
			})
			.catch((error) => {
				if (error instanceof RequiredError) {
					// a required field is missing
				} else {
					// some other error
				}
			});
	};

	unbookmarkRoom = async (rooms: RoomsApi, roomID: string): Promise<void> => {
		// make a request to the backend to check if the room is bookmarked
		rooms
			.unbookmarkRoom(roomID)
			.then((response) => {
				console.log("unbookmarkRoom response: " + response);
				if (response.status === 201) {
					//Created
					//Room bookmarked successfully
					console.log("Room bookmark removed successfully");
				} else if (response.status === 401) {
					//Unauthorized
					//Auth header is either missing or invalid
					throw new Error("Cannot remove bookmark for unauthorized user");
				} else if (response.status === 404) {
					//Not Found
					//Room not found
					throw new Error(
						"Cannot remove bookmark for room that does not exist",
					);
				} else if (response.status === 500) {
					//Internal Server Error
					//Something went wrong in the backend (unlikely lmao)
					throw new Error("Internal server error");
				} else {
					throw new Error("Unknown error");
				}
			})
			.catch((error) => {
				if (error instanceof RequiredError) {
					// a required field is missing
				} else {
					// some other error
				}
			});
	};
}

export default BookmarkService.getInstance();
