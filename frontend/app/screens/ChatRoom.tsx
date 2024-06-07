import React from "react";
import { View } from "react-native";
import CommentWidget from "../components/CommentWidget";

const ChatRoom: React.FC = () => {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <CommentWidget
        username="JohnDoe"
        message="This is a sample comment."
        profilePictureUrl="https://example.com/profile_picture.jpg"
      />
      <CommentWidget
        username="JaneSmith"
        message="Another sample comment here."
        profilePictureUrl="https://example.com/profile_picture.jpg"
      />
      <CommentWidget
        username="AliceWonder"
        message="Yet another comment for demonstration."
        profilePictureUrl="https://example.com/profile_picture.jpg"
      />
    </View>
  );
};

export default ChatRoom;
