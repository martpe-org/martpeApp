import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import OfferCard3 from "../../components/Categories/OfferCard3";
import Search from "../../components/common/Search";
import { styles } from "./cat";
import { SafeAreaView } from "react-native-safe-area-context";
import ProductResultsWrapper from "@/components/search-comp/ProductResultsWrapper";

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

// âœ… Shared Header Component
export const CategoryHeader: React.FC<{
  onSearchPress: () => void;
}> = ({ onSearchPress }) => (
  <SafeAreaView style={styles.headerContainer}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
      <Ionicons name="arrow-back-outline" size={24} color="black" />
    </TouchableOpacity>
    <View style={styles.searchWrapper}>
      <Search onPress={onSearchPress} />
    </View>
  </SafeAreaView>
);

// âœ… Shared Offers Carousel Component
export const OffersCarousel: React.FC<{
  storesData: StoreData[];
  activeColor?: string;
}> = ({ storesData, activeColor = "#E11D48" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

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

// âœ… Shared Sub Categories Component
export const SubCategoriesSection: React.FC<{
  categoryData: CategoryData[];
  domain: string;
  sectionTitle: string;
  searchCategory: string;
}> = ({ categoryData, domain, sectionTitle, searchCategory }) => {
  const renderSubCategoryItem = ({ item }: { item: CategoryData }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/(tabs)/home/result/[search]",
          params: { search: item.name, domainData: domain },
        })
      }
      style={styles.subCategory}
      key={item.id}
    >
      <View style={styles.subCategoryImage}>
        <Image
          source={{ uri: item.image }}
          resizeMode="contain"
          style={styles.subCategoryIcon}
        />
      </View>
      <Text style={styles.subHeadingTextUp} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <View style={styles.subHeading}>
        <Text style={styles.subHeadingText}>{sectionTitle}</Text>
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
        <Text style={styles.viewMoreButtonText}>View More Stores</Text>
        <Image
          source={require("../../assets/right_arrow.png")}
          style={{ marginLeft: 1, width: 12, height: 12, tintColor: "#a00c0c" }}
        />
      </TouchableOpacity>

      <FlatList
        data={categoryData.slice(0, 8)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.subCategories}
        keyExtractor={(item) => `subcat-${item.id}`}
        renderItem={renderSubCategoryItem}
      />
    </View>
  );
};

// âœ… Replaced StoresSection â†’ ProductsSection
export const ProductsSection: React.FC<{
  initialProductsData: any[];
  selectedAddress: any;
  category: string;
  domain: string;
}> = ({ initialProductsData, selectedAddress, category, domain }) => {
  if (!selectedAddress) return null;

  const searchParams = {
    query: category,
    lat: selectedAddress?.lat || 0,
    lon: selectedAddress?.lng || 0,
    pincode: selectedAddress?.pincode || "110001",
    domain,
  };

  return (
    <View style={styles.section}>
      <View style={styles.subHeading}>
        <Text style={styles.subHeadingText}>Top {category}</Text>
      </View>

      <ProductResultsWrapper
        initialData={initialProductsData || []}
        pageSize={10}
        searchParams={searchParams}
      />
    </View>
  );
};

// âœ… Shared Refresh Control
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