import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import OfferCard3 from "../../components/Categories/OfferCard3";
import StoreCard3 from "../../components/Categories/StoreCard3";
import Search from "../../components/common/Search";
import { styles } from "./cat";
const { width } = Dimensions.get("window");

interface CategoryData {
  id: string;
  name: string;
  image: string;
}

interface StoreData {
  id: string;
  slug: string;
  descriptor: {
    name: string;
    symbol: string;
    images: string[];
  };
  address: {
    city: string;
    state: string;
  };
  geoLocation: {
    lat?: number;
    lng?: number;
  };
  calculated_max_offer: {
    percent: number;
  };
  time_to_ship_in_hours?: number;
}

interface SharedComponentsProps {
  categoryData: CategoryData[];
  storesData: StoreData[];
  domain: string;
  selectedAddress: any;
  sectionTitle: string;
  storesSectionTitle: string;
  searchCategory: string;
  gradientColors?: string[];
  activeColor?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  showNoStoresAnimation?: boolean;
}

// ✅ Shared Header Component
export const CategoryHeader: React.FC<{
  onSearchPress: () => void;
}> = ({ onSearchPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity
      onPress={() => router.back()}
      style={styles.backButton}
    >
      <Ionicons name="arrow-back-outline" size={20} color="black" />
    </TouchableOpacity>
    <View style={styles.searchWrapper}>
      <Search onPress={onSearchPress} />
    </View>
  </View>
);

// ✅ Shared Offers Carousel Component
export const OffersCarousel: React.FC<{
  storesData: StoreData[];
  activeColor?: string;
}> = ({ storesData, activeColor = "#E11D48" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll every 3 seconds
  useEffect(() => {
    if (!storesData.length) return;
    const timer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % storesData.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(timer);
  }, [activeIndex, storesData.length]);

  if (!storesData.length) return null;

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={storesData}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `offer-${item.id}-${index}`}
        renderItem={({ item }) => (
          <View style={{ width: width * 0.8, alignItems: "center" }}>
            <OfferCard3 storeData={item} />
          </View>
        )}
        onMomentumScrollEnd={(ev) => {
          const index = Math.round(
            ev.nativeEvent.contentOffset.x / (width * 0.8)
          );
          setActiveIndex(index);
        }}
      />

      {/* Pagination Dots */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {storesData.map((_, index) => (
          <View
            key={index}
            style={{
              width: 6,
              height: 6,
              borderRadius: 4,
              marginHorizontal: 4,
              backgroundColor: activeIndex === index ? activeColor : "#ccc",
            }}
          />
        ))}
      </View>
    </View>
  );
};

// ✅ Shared Sub Categories Component
export const SubCategoriesSection: React.FC<{
  categoryData: CategoryData[];
  domain: string;
  sectionTitle: string;
  searchCategory: string;
  gradientColors?: string[];
  useLinearGradient?: boolean;
}> = ({
  categoryData,
  domain,
  sectionTitle,
  searchCategory,
  gradientColors,
  useLinearGradient = false,
}) => {
  const renderSubCategories = () => {
    return categoryData.slice(0, 8).map((subCategory) => (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: subCategory.name, domainData: domain },
          })
        }
        style={styles.subCategory}
        key={subCategory.id}
      >
        {useLinearGradient && gradientColors ? (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.subCategoryImage}
          >
            <Image
              source={{ uri: subCategory.image }}
              resizeMode="contain"
              style={styles.subCategoryIcon}
            />
          </LinearGradient>
        ) : (
          <View style={styles.subCategoryImage}>
            <Image
              source={{ uri: subCategory.image }}
              resizeMode="contain"
              style={{ width: 80, height: 80 }}
            />
          </View>
        )}
        <Text style={styles.subHeadingTextUp} numberOfLines={1}>
          {subCategory.name}
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View style={styles.section}>
      <View style={styles.subHeading}>
        <View style={styles.line} />
        <Text style={styles.subHeadingText}>{sectionTitle}</Text>
        <View style={styles.line} />
      </View>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/(tabs)/home/result/[search]",
            params: { search: searchCategory, domainData: domain },
          })
        }
        style={styles.viewMoreButton}
      >
        <Text style={styles.viewMoreButtonText}>View More</Text>
        <Image
          source={require("../../assets/right_arrow.png")}
          style={{ marginLeft: 5 }}
        />
      </TouchableOpacity>
      <View style={styles.subCategories}>{renderSubCategories()}</View>
    </View>
  );
};

// ✅ Shared Stores Section Component
export const StoresSection: React.FC<{
  storesData: StoreData[];
  storesSectionTitle: string;
  selectedAddress: any;
  showNoStoresAnimation?: boolean;
}> = ({
  storesData,
  storesSectionTitle,
  selectedAddress,
  showNoStoresAnimation = false,
}) => {
  // Animation for no stores (used only in Food component)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (showNoStoresAnimation && storesData.length === 0) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (storesData.length > 0) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [storesData.length, fadeAnim, scaleAnim, showNoStoresAnimation]);

  return (
    <View style={styles.section}>
      <View style={styles.subHeading}>
        <View style={styles.line} />
        <Text style={styles.subHeadingText}>{storesSectionTitle}</Text>
        <View style={styles.line} />
      </View>

      {storesData.length > 0 ? (
        <FlatList
          data={storesData}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          keyExtractor={(item, index) => `store-${item.id}-${index}`}
          renderItem={({ item }) => (
            <View
              style={{
                width: 300,
                height: 320,
                marginRight: 6,
                marginLeft: -10,
                marginBottom: -20,
              }}
            >
              <StoreCard3
                storeData={item}
                categoryFiltered={[]}
                userLocation={{
                  lat: selectedAddress?.lat || 0,
                  lng: selectedAddress?.lng || 0,
                }}
              />
            </View>
          )}
        />
      ) : showNoStoresAnimation ? (
        <View style={styles.noRestaurantsContainer}>
          <Animated.View
            style={[
              styles.animatedContent,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="restaurant-outline" size={40} color="#999" />
            <Text style={styles.animatedText}>
              No restaurants available in your area
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
};

// ✅ Shared Refresh Control
export const createRefreshControl = (
  isLoading: boolean,
  onRefresh: () => void,
  color: string = "#f2663c"
) => (
  <RefreshControl
    refreshing={isLoading}
    onRefresh={onRefresh}
    colors={[color]}
    tintColor={color}
  />
);