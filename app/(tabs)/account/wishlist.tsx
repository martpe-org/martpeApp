import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Animated,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Dimensions,
} from "react-native";

import useUserDetails from "../../../hook/useUserDetails";
import { useFavoriteStore } from "../../../state/useFavoriteStore";

import HeaderWishlist from "../../../components/wishlist/Header";
import TabBar, { WishlistTab } from "../../../components/wishlist/TabBar";
import FavItems from "../../../components/wishlist/FavItems";
import FavOutlets from "../../../components/wishlist/FavOutlets";
import Loader from "../../../components/common/Loader";
import { styles } from "./WishlistStyles";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25; // must move 25% to switch tabs

const Wishlist = () => {
  const { authToken } = useUserDetails();
  const { allFavorites, isLoading, error, fetchFavs } = useFavoriteStore();

  const [selectedTab, setSelectedTab] = useState<WishlistTab>("Items");
  const [refreshing, setRefreshing] = useState(false);

  const translateX = useRef(new Animated.Value(0)).current;
  const currentOffset = useRef(0);

  // When tab changes manually, animate to new position
  useEffect(() => {
    const toValue = selectedTab === "Items" ? 0 : -width;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      bounciness: 8,
    }).start(() => {
      currentOffset.current = toValue;
    });
  }, [selectedTab]);

  const handleRefresh = useCallback(async () => {
    if (!authToken) return;
    try {
      setRefreshing(true);
      await fetchFavs(authToken);
    } finally {
      setRefreshing(false);
    }
  }, [authToken, fetchFavs]);

  const itemsCount = allFavorites?.products?.length ?? 0;
  const outletsCount = allFavorites?.stores?.length ?? 0;

  // 🌀 Interactive drag gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      },
      onPanResponderMove: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const newX = currentOffset.current + gestureState.dx;
        // limit dragging between 0 and -width
        if (newX <= 0 && newX >= -width) {
          translateX.setValue(newX);
        }
      },
      onPanResponderRelease: (
        _evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, vx } = gestureState;
        let newTab: WishlistTab = selectedTab;
        let toValue = currentOffset.current;

        if (dx < -SWIPE_THRESHOLD || vx < -0.5) {
          newTab = "Stores";
          toValue = -width;
        } else if (dx > SWIPE_THRESHOLD || vx > 0.5) {
          newTab = "Items";
          toValue = 0;
        }

        Animated.spring(translateX, {
          toValue,
          useNativeDriver: true,
          bounciness: 8,
        }).start(() => {
          currentOffset.current = toValue;
          setSelectedTab(newTab);
        });
      },
    })
  ).current;

  const renderItemsPane = () => {
    if (isLoading && !refreshing) return <Loader />;
    if (!authToken)
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
        </View>
      );
    if (error)
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.errorSubtext}>Pull to refresh or try again later</Text>
        </View>
      );
    return <FavItems favorites={allFavorites?.products ?? []} authToken={authToken} />;
  };

  const renderStoresPane = () => {
    if (isLoading && !refreshing) return <Loader />;
    if (!authToken)
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>🔒 Please log in to view favorites</Text>
        </View>
      );
    if (error)
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.errorSubtext}>Pull to refresh or try again later</Text>
        </View>
      );
    return <FavOutlets itemsData={allFavorites?.stores ?? []} authToken={authToken} />;
  };

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <HeaderWishlist />

      <TabBar
        selectedTab={selectedTab}
        selectTab={(tab) => setSelectedTab(tab)}
        itemsCount={itemsCount}
        outletsCount={outletsCount}
        animatedValue={translateX} // 🔥 Pass animation progress
      />

      <Animated.View
        style={[
          styles.carousel,
          { width: width * 2, transform: [{ translateX }] },
        ]}
      >
        {/* Items */}
        <View style={[styles.pane, { width }]}>
          <ScrollView
            style={styles.scrollView}
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
            {renderItemsPane()}
          </ScrollView>
        </View>

        {/* Stores */}
        <View style={[styles.pane, { width }]}>
          <ScrollView
            style={styles.scrollView}
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
            {renderStoresPane()}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
};
export default Wishlist;
