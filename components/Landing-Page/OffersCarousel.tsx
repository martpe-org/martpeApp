import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { HomeOfferType } from "../../hook/fetch-home-type";
import { normalizeStoreData } from "./render";

interface OffersCarouselProps {
  offers: HomeOfferType[];
}

const OffersCarousel: React.FC<OffersCarouselProps> = ({ offers }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { width } = Dimensions.get("window");
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Auto-scroll effect
  useEffect(() => {
    if (offers?.length > 1) {
      scrollInterval.current = setInterval(() => {
        const nextIndex = (activeIndex + 1) % offers.length;
        setActiveIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 2000); // Scroll every 3 seconds
    }

    return () => {
      if (scrollInterval.current) {
        clearInterval(scrollInterval.current);
      }
    };
  }, [activeIndex, offers]);

  if (!offers?.length) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={offers}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) =>
          `offer-${item.offer_id || item.store_id}-${index}`
        }
        renderItem={({ item }) => {
          return (
<TouchableOpacity
  activeOpacity={0.85}
  style={[styles.restaurantCardCarousel, { width: width * 0.85 }]}
  onPress={() => {
    // Normalize the store just like in StoreCard
    const normalized = normalizeStoreData(item.store || item);

    const storeSlug = normalized?.slug;
    if (!storeSlug) {
      console.warn("Offer missing valid store slug:", item);
      return;
    }

    router.push({
      pathname: "/(tabs)/home/result/productListing/[id]",
      params: { id: storeSlug },
    });
  }}
>
              {/* Background image */}
              <Image
                source={{
                  uri:
                    item.images?.[0] ||
                    item.store?.symbol ||
                    "https://via.placeholder.com/300x180?text=Special+Offer",
                }}
                style={styles.restaurantImageCarousel}
                resizeMode="cover"
              />

              {/* Gradient overlay */}
              <LinearGradient
                colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
                style={styles.gradientOverlayCarousel}
              />

              {/* Text overlay */}
              <View style={styles.restaurantInfoOverlay}>
                <Text style={styles.restaurantNameOverlay} numberOfLines={1}>
                  {item.store?.name || "Special Offer"}
                </Text>
                <Text style={styles.restaurantCuisineOverlay} numberOfLines={2}>
                  {item.short_desc || "Limited time offer"}
                </Text>
                {item.qualifier?.min_value && (
                  <Text style={styles.offerConditionOverlay} numberOfLines={1}>
                    Min. order ₹{item.qualifier.min_value}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        onMomentumScrollEnd={(ev) => {
          const index = Math.round(
            ev.nativeEvent.contentOffset.x / (width * 0.85)
          );
          setActiveIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: width * 0.85,
          offset: width * 0.85 * index,
          index,
        })}
        snapToInterval={width * 0.85}
        snapToAlignment="center"
        decelerationRate="fast"
      />

      {/* Pagination dots */}
      <View style={styles.carouselDotsContainer}>
        {offers.map((_, index) => (
          <View
            key={index}
            style={[
              styles.carouselDot,
              {
                backgroundColor: activeIndex === index ? "#FF6B35" : "#ccc",
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  restaurantCardCarousel: {
    width: Dimensions.get("window").width * 0.85,
    height: 180,
    borderRadius: 16,
    marginRight: 14,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  restaurantImageCarousel: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  gradientOverlayCarousel: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  restaurantInfoOverlay: {
    position: "absolute",
    bottom: 14,
    left: 14,
    right: 14,
  },
  restaurantNameOverlay: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  restaurantCuisineOverlay: {
    fontSize: 13,
    color: "#ddd",
    marginBottom: 6,
  },
  offerConditionOverlay: {
    fontSize: 11,
    color: "#bbb",
    fontStyle: "italic",
  },
  carouselDotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 8,
  },
  carouselDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "#ccc",
  },
});

export default OffersCarousel;
