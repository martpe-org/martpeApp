import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Text,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";

const { width } = Dimensions.get("window");
const snapInterval = width;

interface ImageCarouselProps {
  url: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ url }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollPosition / snapInterval);
    setActiveIndex(currentIndex);
  }, []);

  const imageStyle = useCallback((index: number) => ({
    width: "100%" as const,
    height: "100%" as const,
    resizeMode: "cover" as const,
    // borderRadius: 10,
  }), []);

  // Handle empty or invalid URL array
  if (!url || !Array.isArray(url) || url.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Text style={styles.noImageText}>No images available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={snapInterval}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16} // Add throttling for better performance
      >
        {url.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image 
              source={{ uri: image }} 
              style={imageStyle(index)}
            //  defaultSource={require('../../assets/placeholder.png')} // Add placeholder if needed
            />
          </View>
        ))}
      </ScrollView>
      
      {url.length > 1 && (
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {activeIndex + 1}/{url.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginBottom: width * 0.05,
    // paddingHorizontal: width * 0.05,
  },
  imageContainer: {
    marginTop: width * 0.05,
    width: width,
    height: 200,
    marginRight: width * 0.02,
    // borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainerSingle: {
    marginTop: width * 0.05,
    width: width * 0.9,
    height: 200,
    borderColor: "#BBC8D1",
    borderWidth: 1,
    marginLeft: width * 0.05,
    // borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorContainer: {
    alignItems: "center",
  },
  indicatorText: {
    backgroundColor: "#656565",
    width: width * 0.1,
    textAlign: "center",
    color: "white",
    borderRadius: 100,
    marginTop: width * 0.02,
    fontSize: 12,
    paddingVertical: 2,
  },
  noImageText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});