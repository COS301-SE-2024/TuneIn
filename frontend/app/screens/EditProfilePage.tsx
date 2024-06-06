import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import GenreBubble from '../components/GenreBubble';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/FontAwesome'
import { MaterialIcons } from '@expo/vector-icons';
import { rgbaColor } from 'react-native-reanimated/lib/typescript/reanimated2/Colors';

const EditProfileScreen = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [instagramLink, setInstagramLink] = useState('');
    const [twitterLink, setTwitterLink] = useState('');
    const genres = ["Pop", "Hip-Hop", "Jazz", "Classical", "Rock"]
    const [favoriteSongs, setFavoriteSongs] = useState([]);

    // Function to handle saving profile
    const saveProfile = () => {
        // Logic to save profile data
    };

    // Function to show edit dialog
    const showEditDialog = (field, controller, maxLines = 1) => {
        // Logic to show edit dialog
    };

    const mockImage = require("../Assets/MockProfilePic.jpeg");

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.profileHeader}>
                <TouchableOpacity onPress={() => { }} style={styles.saveButton}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Edit Profile</Text>
                    <TouchableOpacity onPress={() => { }} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
                {/* Fetch data */}
                <View style={styles.profilePictureContainer}>
                    <Image
                        source={mockImage}
                        style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
                    />
                    <TouchableOpacity onPress={() => { }} style={styles.changePhotoButton}>
                        <Text>Change Photo</Text>
                    </TouchableOpacity>
                </View>
                {/* Name */}
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Name</Text>
                    <TouchableOpacity onPress={() => showEditDialog('Name', setName)} style={styles.editButton}>
                        <Text style={{marginLeft: 42,}}>John Doe</Text>
                    </TouchableOpacity>
                </View>
                {/* Username */}
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Username</Text>
                    <TouchableOpacity onPress={() => showEditDialog('Username', setUsername)} style={styles.editButton}>
                        <Text style={{marginLeft: 15,}}>@john{username}</Text>
                    </TouchableOpacity>
                </View>
                {/* Bio */}
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Bio</Text>
                    <TouchableOpacity onPress={() => showEditDialog('Bio', setBio, 3)} style={styles.editButton}>
                        <Text style={{marginLeft: 60,}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do</Text>
                    </TouchableOpacity>
                </View>
                {/* Social */}
                <View style={styles.divider} />
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Social</Text>
                </View>
                <View style={styles.listItem}>
                    <Text style={styles.subTitle}>instagram.com/john</Text>
                    <TouchableOpacity onPress={() => showEditDialog('Instagram Link', setInstagramLink)} style={styles.editButton}>
                        <Text>{instagramLink}</Text>
                    </TouchableOpacity>
                </View>
                {/* <View style={styles.listItem}>
          <Text style={styles.subTitle}>Twitter</Text>
          <TouchableOpacity onPress={() => showEditDialog('Twitter Link', setTwitterLink)} style={styles.editButton}>
            <Text>{twitterLink}</Text>
          </TouchableOpacity>
        </View> */}
                {/* Genres */}
                <View style={styles.divider} />
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Genres</Text>
                </View>
                <View style={styles.chipsContainer}>
                    {genres.map((genre, index) => (
                        <GenreBubble key={index} text={genre} />
                    ))}
                    {/* Render add genre button */}
                    <TouchableOpacity onPress={() => { }} style={styles.addGenreButton}>
                        <Text style={{
                            color: 'black',
                            fontWeight: '500',
                            fontSize: 14,
                        }}>Add +</Text>
                    </TouchableOpacity>
                </View>
                {/* Favorite Songs */}
                <View style={styles.divider} />
                <View style={styles.listItem}>
                    <Text style={styles.listItemTitle}>Favorite Songs</Text>
                </View>
                 <View style={styles.container1}>
                 <View style={styles.playingContainer}>
      <View style={styles.albumArt}></View>
      <View style={styles.detailsContainer}>
        <Text style={styles.songTitle}>Don't Smile At Me</Text>
        <Text style={styles.artist}>Billie Eilish</Text>
      </View>
      <Text style={styles.duration}>5:33</Text>
      <MaterialIcons name="more-horiz" size={24} color="black" style={styles.moreIcon} />
    </View>
     
    </View>
     <View style={styles.container1}>
                 <View style={styles.playingContainer}>
      <View style={styles.albumArt}></View>
      <View style={styles.detailsContainer}>
        <Text style={styles.songTitle}>Don't Smile At Me</Text>
        <Text style={styles.artist}>Billie Eilish</Text>
      </View>
      <Text style={styles.duration}>5:33</Text>
      <MaterialIcons name="more-horiz" size={24} color="black" style={styles.moreIcon} />
    </View></View>
<View style={{flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center'}}>
  <View style={styles.container2}>
            <Text style={styles.text}>Add Song  <Icons name="plus" size={14} color="black" /></Text>
        </View>
</View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({

text: {
        color: 'black',
        fontWeight: '500',
        fontSize: 14,
    },
    container2: {
        marginRight: 12,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(232, 235, 242, 1)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },

//favourite songs
  container1: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  playingContainer: {
    width: 310,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    marginTop: 10, // Adjusted marginTop for space
    paddingVertical: 10, // Added paddingVertical for space
  },
  albumArt: {
    width: 57,
    height: 57,
    borderRadius: 12,
    backgroundColor: 'rgba(158, 171, 184, 1)',
    marginRight: 16,
  },
  detailsContainer: {
    paddingRight: 40,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 5,
  },
  duration: {
    marginLeft: 10,
  },
  moreIcon: {
    marginLeft: 30,
  },


//stuff
    container: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    saveButton: {
        padding: 10,
    },
    saveButtonText: {
        color: 'grey',
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    changePhotoButton: {
        marginTop: 10,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    listItemTitle: {
        fontWeight: 'bold',
    },
    subTitle: {
        fontWeight: 'bold',
        color: 'grey',
    },
    editButton: {
        padding: 5,
        width: 250,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: 'grey',
        marginVertical: 20,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
    },
    chip: {
        padding: 10,
        borderRadius: 20,
        backgroundColor: 'lightgrey',
        marginRight: 10,
        marginBottom: 10,
    },
    chipText: {
        fontWeight: 'bold',
    },
    addGenreButton: {
        marginRight: 12,
        marginBottom: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(232, 235, 242, 1)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default EditProfileScreen;
