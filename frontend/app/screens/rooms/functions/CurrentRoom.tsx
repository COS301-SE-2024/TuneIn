import * as utils from "../../../services/Utils";

class CurrentRoom {
    getCurrentRoom = async (token: string) => {
        try {
            const response = await fetch(`${utils.API_BASE_URL}/rooms/current/room`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            // if status code is 404, it means there is no current room
            if (response.status === 404) {
                return null;
            }
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    };

    isCurrentRoom = async (token: string, roomID: string) => {
        try {
            console.log("Room ID being passed around: ", roomID);
            const response = await fetch(`${utils.API_BASE_URL}/rooms/current/room`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            // if status code is 404, it means there is no current room
            if (response.status === 404) {
                return false;
            }
            console.log("Current Room:", data.room.room_id);
            if (data.room.room_id === roomID) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error:", error);
        }
    }

    leaveJoinRoom = async (token: string, roomID: string, isLeaving: boolean) => {
        try {
            const response = await fetch(
                `${utils.API_BASE_URL}/rooms/${roomID}/${isLeaving ? "leave" : "join"}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            const data = await response.json();
            console.log("Data:", data + " " + response.status);
            if (response.status === 201) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error:", error);
        }
    };
}

export default CurrentRoom;