import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Foundation } from '@expo/vector-icons';

const Voting = ({ voteCount, setVoteCount, index, swapSongs }) => {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);

  const handleUpvote = () => {
    if (!upvoted) {
      setVoteCount((prevCount) => prevCount + 1, index);
      setUpvoted(true);
      setDownvoted(false);
      swapSongs(index, 'up');
    }
  };

  const handleDownvote = () => {
    if (!downvoted) {
      setVoteCount((prevCount) => prevCount - 1, index);
      setUpvoted(false);
      setDownvoted(true);
      swapSongs(index, 'down');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUpvote}>
        <Foundation name="arrow-up" size={24} color={upvoted ? '#08BDBD' : 'black'} />
      </TouchableOpacity>
      <Text style={[styles.voteCount, { color: upvoted || downvoted ? '#08BDBD' : 'black' }]}>
        {voteCount}
      </Text>
      <TouchableOpacity onPress={handleDownvote}>
        <Foundation name="arrow-down" size={24} color={downvoted ? '#08BDBD' : 'black'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8, // Space between icons and count
  },
});

export default Voting;
