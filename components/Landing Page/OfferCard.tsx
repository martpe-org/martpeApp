import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { router } from "expo-router";
import { widthPercentageToDP } from "react-native-responsive-screen";

const { width: screenWidth } = Dimensions.get("window");
const CARD_WIDTH = screenWidth * 0.85;
const CARD_MARGIN = screenWidth * 0.075; // to center
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN * 2; // snap width

const OfferCard = ({ items }: { items: {
  id: string;
  calculated_max_offer?: { percent?: number };
  descriptor?: { name?: string; symbol?: string };
}[] }) => {  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll
  useEffect(() => {
    if (!items || items.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
      setActiveIndex(nextIndex);

      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({
          x: nextIndex * SNAP_INTERVAL,
          animated: true,
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [activeIndex, items?.length]);

  const getOfferBackground = (num: number) => {
    const colors = [
      "#FF5151", "#FFA02F", "#1296B3", "#EB0DA0", "#D45793",
      "#CD9800", "#8E92FB", "#8D77B3", "#96D2DB", "#3EBB3C",
    ];
    return colors[num % colors.length];
  };

  const handleScroll = (event: any) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / SNAP_INTERVAL);
    setActiveIndex(index);
  };

  if (!items || items.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={SNAP_INTERVAL}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContainer}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={item?.id || index}
            onPress={() =>
              router.push(`/(tabs)/home/result/productListing/${item?.id}`)
            }
            style={[
              styles.cardOffer,
              {
                backgroundColor: getOfferBackground(index),
                width: CARD_WIDTH,
                marginHorizontal: CARD_MARGIN,
              },
            ]}
          >
            {/* Text Section */}
            <View style={styles.textContainer}>
              <Text style={styles.offerHeaderText}>
                Upto {Math.ceil(item?.calculated_max_offer?.percent ?? 0)}% Off
              </Text>
              <Text style={styles.offerSubHeaderText}>
                on {item?.descriptor?.name}
              </Text>

              <TouchableOpacity style={styles.shopNowButton}>
                <Text
                  style={[
                    styles.shopNowText,
                    { color: getOfferBackground(index) },
                  ]}
                >
                  Order Now
                </Text>
              </TouchableOpacity>

              <Text style={styles.tcText}>*T&C apply</Text>
            </View>

            {/* Image Section */}
            <View style={styles.offerImageContainer}>
              {item?.descriptor?.symbol ? (
                <Image
                  source={{ uri: item.descriptor.symbol }}
                  style={styles.offerImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.offerImage, { backgroundColor: "#fff3" }]} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {items.length > 1 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationText}>
            {activeIndex + 1}/{items.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  scrollContainer: { alignItems: "center" },
  cardOffer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingLeft: 20,
    paddingRight: 15,
    alignItems: "center",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  textContainer: { flex: 1 },
  offerHeaderText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  offerSubHeaderText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 2,
  },
  shopNowButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 25,
    alignSelf: "flex-start",
    marginVertical: 15,
    elevation: 2,
  },
  shopNowText: { fontWeight: "bold", fontSize: 12, textAlign: "center" },
  tcText: { marginTop: 5, fontSize: 8, color: "white" },
  offerImageContainer: { marginLeft: 10, alignItems: "center", justifyContent: "center" },
  offerImage: {
    height: widthPercentageToDP(20),
    width: widthPercentageToDP(20),
    borderRadius: 5,
  },
  paginationContainer: { alignItems: "center", marginTop: 10 },
  paginationText: {
    backgroundColor: "#656565",
    color: "#FFFFFF",
    textAlign: "center",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: "500",
  },
});

export default OfferCard;
