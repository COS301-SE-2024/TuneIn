import React from "react";
import WelcomeScreen from "./screens/WelcomeScreen";
import ChatRoomScreen from "./screens/ChatRoom";

export default function App() {
	//return <WelcomeScreen />;
    const roomInfo = '{"creator":{"profile_name":"kane","userID":"413c6268-6051-7024-2806-f4627605df0b","username":"@gmail.com","profile_picture_url":"https://images.unsplash.com/photo-1628563694622-5a76957fd09c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwcm9maWxlLWxpa2VkfDF8fHxlbnwwfHx8fHw%3D","followers":{"count":0,"data":[]},"following":{"count":0,"data":[]},"links":{"count":0,"data":[]},"bio":"im new","current_song":{"title":"","artists":[],"cover":"","start_time":"2024-06-20T19:09:23.506Z"},"fav_genres":{"count":0,"data":[]},"fav_songs":{"count":0,"data":[]},"fav_rooms":{"count":0,"data":[]},"recent_rooms":{"count":0,"data":[]}},"roomID":"777b6f7c-71f3-4ad5-849b-5eea361d7d87","participant_count":0,"room_name":"\'Concrete Boys\' album listening session","description":"We will be gathering to listen to the new album by Lil Yatchy\'s eclectic new collective \'Concrete Boys\'","is_temporary":true,"is_private":false,"is_scheduled":false,"start_date":"2024-06-20T19:09:23.431Z","end_date":"2024-06-20T19:09:23.431Z","language":"English","has_explicit_content":true,"has_nsfw_content":false,"room_image":"https://media.pitchfork.com/photos/66143cc84fbf8f78dfee2468/16:9/w_1280,c_limit/Concrete%20Boys-%20It\'s%20Us%20Vol.%201.jpg","current_song":{"title":"","artists":[],"cover":"","start_time":"2024-06-20T19:09:23.431Z"},"tags":[]}';
	return <ChatRoomScreen room={JSON.parse(roomInfo)} />;
}
