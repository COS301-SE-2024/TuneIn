import React from 'react';
import { View, StyleSheet,Text, FlatList,Dimensions } from 'react-native';
import { RoomCard } from './models/RoomCard';
import RoomCardWidget from './RoomCardWidget';
import Carousel from 'react-native-reanimated-carousel';

interface CarouselProps {
}

const AppCarousel: React.FC<CarouselProps> = () =>{
  const screenWidth = Dimensions.get('window').width;
  const list =[
      {
        id:1,
        title:'first item',
        image : 'https://static.vecteezy.com/system/resources/thumbnails/001/849/553/small_2x/modern-gold-background-free-vector.jpg'
      },
      {
        id:2,
        title:'second item',
        image : 'https://static.vecteezy.com/system/resources/thumbnails/001/849/553/small_2x/modern-gold-background-free-vector.jpg'
      },
      {
        id:3,
        title:'third item',
        image : 'https://static.vecteezy.com/system/resources/thumbnails/001/849/553/small_2x/modern-gold-background-free-vector.jpg'
      },
      {
        id:4,
        title:'forth item',
        image : 'https://static.vecteezy.com/system/resources/thumbnails/001/849/553/small_2x/modern-gold-background-free-vector.jpg'
      }
  ]
    return (
      <View >
       <Carousel
       width={screenWidth}
       height = {screenWidth /2}
       data = {list}
       renderItem={({item}) => (
        <view>
          
        </view>
       )}
       />
      </View>
    )};
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  

export default AppCarousel;
