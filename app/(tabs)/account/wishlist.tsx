import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Animated,
  PanResponder,
  ScrollView,
  RefreshControl,
  Dimensions,
  Text,
} from "react-native";
import useUserDetails from "../../../hook/useUserDetails";
import { useFavoriteStore } from "../../../state/useFavoriteStore";
import HeaderWishlist from "../../../components/wishlist/Header";
import FavItems from "../../../components/wishlist/FavItems";
import FavOutlets from "../../../components/wishlist/FavOutlets";
import Loader from "../../../components/common/Loader";
import TabBar from "../../../components/wishlist/TabBar";
import { styles } from "./WishlistStyles";
import { Easing } from "react-native";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

const Wishlist = () => {
  const { authToken } = useUserDetails();
  const { allFavorites, isLoading, fetchFavs, error } = useFavoriteStore();

  const [isItem, setIsItem] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-fetch favorites on mount
  useEffect(() => {
    if (!authToken) return;
    if (!allFavorites?.products?.length && !allFavorites?.stores?.length) {
      fetchFavs(authToken);
    }
  }, [authToken]);

  // Animate tab/content change on toggle
  const animateTo = (nextIsItem: boolean) => {
    const toValue = nextIsItem ? 0 : -width;
    setIsAnimating(true);
    Animated.timing(translateX, {
      toValue,
      duration: 280,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      currentOffset.current = toValue;
      setIsItem(nextIsItem);
      setIsAnimating(false);
    });
  };

  // Swipe gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        if (isAnimating) return;
        const newX = currentOffset.current + g.dx;
        if (newX <= 0 && newX >= -width) translateX.setValue(newX);
      },
      onPanResponderRelease: (_, g) => {
        const { dx, vx } = g;
        const swipePower = dx + vx * 200;
        let nextIsItem = isItem;
        let toValue = currentOffset.current;

        if (swipePower < -SWIPE_THRESHOLD) {
          nextIsItem = false;
          toValue = -width;
        } else if (swipePower > SWIPE_THRESHOLD) {
          nextIsItem = true;
          toValue = 0;
        }

        Animated.timing(translateX, {
          toValue,
          duration: 280,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }).start(() => {
          currentOffset.current = toValue;
          setIsItem(nextIsItem);
        });
      },
    })
  ).current;

  const handleRefresh = async () => {
    if (!authToken) return;
    try {
      setRefreshing(true);
      await fetchFavs(authToken);
    } finally {
      setRefreshing(false);
    }
  };

  const itemsCount = allFavorites?.products?.length ?? 0;
  const storesCount = allFavorites?.stores?.length ?? 0;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <HeaderWishlist />

      <TabBar
        isItem={isItem}
        tabAnim={translateX.interpolate({
          inputRange: [-width, 0],
          outputRange: [1, 0],
          extrapolate: "clamp",
        })}
        itemsCount={itemsCount}
        storesCount={storesCount}
        setIsItem={(val) => animateTo(val)}
      />

      <Animated.View
        style={{
          flexDirection: "row",
          width: width * 2,
          transform: [{ translateX }],
        }}
      >
        {/* ITEMS */}
        <View style={{ width }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#0066CC"]}
                tintColor="#0066CC"
              />
            }
          >
            {isLoading && !refreshing ? (
              <Loader />
            ) : error ? (
              <Text style={styles.errorText}>❌ {error}</Text>
            ) : (
              <FavItems favorites={allFavorites?.products ?? []} authToken={authToken} />
            )}
          </ScrollView>
        </View>

        {/* STORES */}
        <View style={{ width }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#0066CC"]}
                tintColor="#0066CC"
              />
            }
          >
            {isLoading && !refreshing ? (
              <Loader />
            ) : error ? (
              <Text style={styles.errorText}>❌ {error}</Text>
            ) : (
              <FavOutlets itemsData={allFavorites?.stores ?? []} authToken={authToken} />
            )}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
};

export default Wishlist;
