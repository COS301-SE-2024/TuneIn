import React from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';

interface CarouselProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => JSX.Element;
}

const AppCarousel = <T,>({ data, renderItem }: CarouselProps<T>) => {
  return (
    <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppCarousel;
