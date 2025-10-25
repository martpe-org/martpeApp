import React, { useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Text,
  Modal,
  SafeAreaView,
} from "react-native";
import LikeButton from "../common/likeButton";
import ShareButton from "../common/Share";
import { styles } from "./imageCarouselStyes";
import FullScreenImageViewer from "./FullScreenImageViewer";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

interface ImageCarouselProps {
  url: string[];
  productId: string;
  productName: string;
  storeName: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  url,
  productId,
  productName,
  storeName,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const carouselRef = useRef<FlatList<string>>(null);
  const router = useRouter();

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleCarouselScroll = (event: any) => {
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setSelectedIndex(currentIndex);
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
  };

  if (!url || url.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImageText}>No images available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back-outline" size={25} color="black" />
      </TouchableOpacity>
      {/* Main Carousel */}
      <View style={styles.carouselWrapper}>
        <FlatList
          ref={carouselRef}
          horizontal
          pagingEnabled
          scrollEventThrottle={16}
          data={url}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={openFullScreen}
              style={styles.imageContainer}
            >
              <Image source={{ uri: item }} style={styles.image} resizeMode="contain" />
            </TouchableOpacity>
          )}
          onMomentumScrollEnd={handleCarouselScroll}
        />

        {/* Counter centered over image */}
        <View style={styles.counterOverlay}>
          <Text style={styles.counterText}>{selectedIndex + 1}/{url.length}</Text>
        </View>

        {/* Arrows */}
        <TouchableOpacity
          style={[styles.navButtonOut, styles.navLeft]}
          onPress={() => handleThumbnailPress(Math.max(selectedIndex - 1, 0))}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButtonOut, styles.navRight]}
          onPress={() => handleThumbnailPress(Math.min(selectedIndex + 1, url.length - 1))}
        >
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Like + Share buttons */}
      {!isFullScreen && (
        <View style={styles.outsideActionsContainer}>
          <View style={styles.actionLikeButton}>
            <LikeButton productId={productId} color="#E11D48" />
          </View>
          <View style={styles.actionButton}>
            <ShareButton
              productId={productId}
              productName={productName}
              storeName={storeName} 
              type="item"
            />
          </View>
        </View>
      )}

      {/* Full Screen Modal */}
      <Modal visible={isFullScreen} transparent={true} animationType="fade">
        <SafeAreaView style={styles.fullScreenContainer}>
          <FullScreenImageViewer
            images={url}
            initialIndex={selectedIndex}
            onClose={closeFullScreen}
            onIndexChange={setSelectedIndex}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default ImageCarousel;