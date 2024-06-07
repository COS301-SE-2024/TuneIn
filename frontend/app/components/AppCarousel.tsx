import React from 'react';
import { View, FlatList } from 'react-native';

interface CarouselProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => JSX.Element;
}

const AppCarousel = <T,>({ data, renderItem }: CarouselProps<T>) => {
  return (
    <View className="flex-1 justify-center items-center">
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View className="w-7" />} // Add space between items
      />
    </View>
  );
};

export default AppCarousel;
