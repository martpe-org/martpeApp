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
import { Feather } from "@expo/vector-icons";

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const carouselRef = useRef<FlatList<string>>(null);
  const fullScreenRef = useRef<FlatList<string>>(null);
  const thumbnailRef = useRef<FlatList<string>>(null);
  const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSlideshow, setIsSlideshow] = useState(false);

  const handleThumbnailPress = (index: number) => {
    setSelectedIndex(index);
    carouselRef.current?.scrollToIndex({ index, animated: true });
  };
  const startSlideshow = () => {
    setIsSlideshow(true);
    let currentIndex = selectedIndex;
    slideshowIntervalRef.current = setInterval(() => {
      currentIndex = (currentIndex + 1) % url.length;
      setSelectedIndex(currentIndex);
      fullScreenRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, 2000);
  };

  const stopSlideshow = () => {
    setIsSlideshow(false);
    if (slideshowIntervalRef.current) {
      clearInterval(slideshowIntervalRef.current);
      slideshowIntervalRef.current = null;
    }
  };
  const handleCarouselScroll = (event: any) => {
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setSelectedIndex(currentIndex);
  };

  const handleFullScreenImageChange = (event: any) => {
    const currentIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setSelectedIndex(currentIndex);
  };

  const openFullScreen = () => {
    setIsFullScreen(true);
    setZoomLevel(1);
    fullScreenRef.current?.scrollToIndex({
      index: selectedIndex,
      animated: false,
    });
    // Scroll thumbnails to current index when opening fullscreen
    setTimeout(() => {
      thumbnailRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
    }, 100);
  };

  const closeFullScreen = () => {
    setIsFullScreen(false);
    setZoomLevel(1);
  };

  if (!url || url.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noImageText}>No images available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

      <Modal visible={isFullScreen} transparent={true} animationType="fade">
        <SafeAreaView style={styles.fullScreenContainer}>

          {/* Top controls */}
          <View style={styles.topControls}>
            <TouchableOpacity onPress={() => setZoomLevel(Math.min(zoomLevel + 0.5, 3))}>
              <Feather name="zoom-in" style={styles.topIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setZoomLevel(Math.max(zoomLevel - 0.5, 1))}>
              <Feather name="zoom-out" style={styles.topIcon} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={isSlideshow ? stopSlideshow : startSlideshow}
            >
              <Text style={styles.topIcon}>{isSlideshow ? "⏸" : "▶"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={closeFullScreen}>
              <Text style={styles.topClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Fullscreen FlatList */}
          <FlatList
            ref={fullScreenRef}
            horizontal
            pagingEnabled
            scrollEventThrottle={16}
            data={url}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.fullScreenImageWrapper}>
                <Image
                  source={{ uri: item }}
                  style={[styles.fullScreenImage, { transform: [{ scale: zoomLevel }] }]}
                  resizeMode="contain"
                />
              </View>
            )}
            onMomentumScrollEnd={handleFullScreenImageChange}
            initialScrollIndex={selectedIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />

          <TouchableOpacity
            style={[styles.navButton, styles.navLeft]}
            onPress={() => {
              const newIndex = Math.max(selectedIndex - 1, 0);
              setSelectedIndex(newIndex);
              fullScreenRef.current?.scrollToIndex({ index: newIndex, animated: true });
              thumbnailRef.current?.scrollToIndex({ index: newIndex, animated: true });
            }}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.navRight]}
            onPress={() => {
              const newIndex = Math.min(selectedIndex + 1, url.length - 1);
              setSelectedIndex(newIndex);
              fullScreenRef.current?.scrollToIndex({ index: newIndex, animated: true });
              thumbnailRef.current?.scrollToIndex({ index: newIndex, animated: true });
            }}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>

          {/* Fullscreen Thumbnail Strip */}
          {/* Counter ABOVE the thumbnail container */}
          <View style={styles.counterAboveThumbnailContainer}>
            <Text style={styles.counterAboveThumbnails}>
              {selectedIndex + 1}/{url.length}
            </Text>
          </View>

          {/* Thumbnail Container */}
          <View style={styles.thumbnailStripContainer}>
            <FlatList
              ref={thumbnailRef}
              horizontal
              data={url}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}
              keyExtractor={(_, index) => `fullscreen-thumb-${index}`}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedIndex(index);
                    fullScreenRef.current?.scrollToIndex({ index, animated: true });
                  }}
                  style={[
                    styles.thumbBox,
                    selectedIndex === index && styles.thumbActive
                  ]}
                >
                  <Image
                    source={{ uri: item }}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
              getItemLayout={(data, index) => ({
                length: 68,
                offset: 68 * index,
                index,
              })}
            />
          </View>
        </SafeAreaView>
      </Modal>

    </View>
  );
};

export default ImageCarousel;