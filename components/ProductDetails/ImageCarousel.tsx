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

interface ImageCarouselProps {
  url: any; // can be string, string[], or object[]
}

const normalizeImages = (images: any): string[] => {
  if (!images) return [];
  if (typeof images === "string") return [images];
  if (Array.isArray(images)) {
    return images.map((img) =>
      typeof img === "string" ? img : img?.url || ""
    ).filter(Boolean);
  }
  return [];
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({ url }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const imageUrls = normalizeImages(url);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const currentIndex = Math.round(scrollPosition / width);
      setActiveIndex(currentIndex);
    },
    []
  );

  if (imageUrls.length === 0) {
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
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {imageUrls.map((image, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {imageUrls.length > 1 && (
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {activeIndex + 1}/{imageUrls.length}
          </Text>
        </View>
      )}
    </View>
  );
};

export default ImageCarousel;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: width,
    height: width * 0.75,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  indicatorContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  indicatorText: {
    backgroundColor: "#656565",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  noImageText: {
    fontSize: 16,
    color: "#666",
  },
});
