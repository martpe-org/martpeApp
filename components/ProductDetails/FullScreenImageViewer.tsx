import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { styles } from "./imageCarouselStyes";
import ZoomableImage from "./ZoomableImage";
import ImageComp from "../common/ImageComp";

const { width } = Dimensions.get("window");

interface FullScreenImageViewerProps {
    images: string[];
    initialIndex: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
}

const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
    images,
    initialIndex,
    onClose,
    onIndexChange,
}) => {
    const [selectedIndex, setSelectedIndex] = useState(initialIndex);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isSlideshow, setIsSlideshow] = useState(false);

    const fullScreenRef = useRef<FlatList<string>>(null);
    const thumbnailRef = useRef<FlatList<string>>(null);
    const slideshowIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Slideshow controls
    const startSlideshow = () => {
        if (isZoomed) return;
        setIsSlideshow(true);
        let currentIndex = selectedIndex;
        slideshowIntervalRef.current = setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            setSelectedIndex(currentIndex);
            onIndexChange(currentIndex);
            fullScreenRef.current?.scrollToIndex({ index: currentIndex, animated: true });
            thumbnailRef.current?.scrollToIndex({ index: currentIndex, animated: true });
        }, 2000);
    };

    const stopSlideshow = () => {
        setIsSlideshow(false);
        if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
        slideshowIntervalRef.current = null;
    };

    const handleZoomChange = (zoomed: boolean) => {
        if (zoomed !== isZoomed) {
            setIsZoomed(zoomed);
            if (zoomed && isSlideshow) stopSlideshow();
        }
    };

    const handleFullScreenImageChange = (event: any) => {
        if (isZoomed) return;
        const currentIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        if (currentIndex !== selectedIndex) {
            setSelectedIndex(currentIndex);
            onIndexChange(currentIndex);
            setTimeout(() => thumbnailRef.current?.scrollToIndex({
                index: currentIndex,
                animated: true,
                viewPosition: 0.5,
            }), 100);
        }
    };

    // Navigation
    const navigateToPrevious = () => {
        if (isZoomed) return;
        const newIndex = Math.max(selectedIndex - 1, 0);
        setSelectedIndex(newIndex);
        onIndexChange(newIndex);
        fullScreenRef.current?.scrollToIndex({ index: newIndex, animated: true });
        thumbnailRef.current?.scrollToIndex({ index: newIndex, animated: true });
    };

    const navigateToNext = () => {
        if (isZoomed) return;
        const newIndex = Math.min(selectedIndex + 1, images.length - 1);
        setSelectedIndex(newIndex);
        onIndexChange(newIndex);
        fullScreenRef.current?.scrollToIndex({ index: newIndex, animated: true });
        thumbnailRef.current?.scrollToIndex({ index: newIndex, animated: true });
    };

    const navigateToIndex = (index: number) => {
        if (isZoomed) return;
        setSelectedIndex(index);
        onIndexChange(index);
        fullScreenRef.current?.scrollToIndex({ index, animated: true });
    };

    // Cleanup
    React.useEffect(() => () => {
        if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* Top Controls */}
            <View style={styles.topControls}>
                <Text style={[styles.topIcon, { fontSize: 14 }]}>Pinch to zoom</Text>
                <TouchableOpacity
                    onPress={isSlideshow ? stopSlideshow : startSlideshow}
                    disabled={isZoomed}
                    style={{ opacity: isZoomed ? 0.3 : 1 }}
                >
                    <Text style={styles.topIcon}>{isSlideshow ? "⏸" : "▶"}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose}><Text style={styles.topClose}>✕</Text></TouchableOpacity>
            </View>

            {/* Fullscreen images */}
            <FlatList
                ref={fullScreenRef}
                horizontal
                pagingEnabled={!isZoomed}
                scrollEnabled={!isZoomed}
                scrollEventThrottle={16}
                data={images}
                keyExtractor={(_, index) => `fullscreen-${index}`}
                renderItem={({ item, index }) => (
                    <ZoomableImage uri={item} isActive={index === selectedIndex} onZoomChange={handleZoomChange} />
                )}
                onMomentumScrollEnd={handleFullScreenImageChange}
                initialScrollIndex={initialIndex}
                getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            />

            {/* Navigation */}
            {!isZoomed && <>
                <TouchableOpacity
                    style={[styles.navButton, styles.navLeft, isZoomed && { opacity: 0.3 }]}
                    onPress={navigateToPrevious}
                    disabled={selectedIndex === 0 || isZoomed}
                >
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.navRight, isZoomed && { opacity: 0.3 }]}
                    onPress={navigateToNext}
                    disabled={selectedIndex === images.length - 1 || isZoomed}
                >
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </>}

            {/* Counter */}
            <View style={styles.counterAboveThumbnailContainer}>
                <Text style={styles.counterAboveThumbnails}>{selectedIndex + 1}/{images.length}</Text>
            </View>

            {/* Thumbnails */}
            <View style={styles.thumbnailStripContainer}>
                <FlatList
                    ref={thumbnailRef}
                    horizontal
                    data={images}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.thumbnailStrip}
                    keyExtractor={(_, index) => `fullscreen-thumb-${index}`}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => navigateToIndex(index)}
                            style={[styles.thumbBox, selectedIndex === index && styles.thumbActive]}
                        >
                            <ImageComp
                                source={{ uri: item }}
                                imageStyle={styles.thumbImage}
                                resizeMode="cover" />
                        </TouchableOpacity>
                    )}
                    getItemLayout={(data, index) => ({ length: 68, offset: 68 * index, index })}
                />
            </View>
        </GestureHandlerRootView>
    );
};

export default FullScreenImageViewer;
