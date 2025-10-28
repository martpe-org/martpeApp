import { Feather, Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { router, useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { Animated, Text, TextInput, TouchableOpacity, View, Dimensions } from "react-native";
import useDeliveryStore from "../../../../components/address/deliveryAddressStore";
import Loader from "../../../../components/common/Loader";
import FoodDetailsComponent from "../../../../components/ProductDetails/FoodDetails";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../../../components/search/search-products";
import { searchStores } from "../../../../components/search/search-stores";
import { styles } from "@/components/search-comp/searchStyle";
import SwipeTabs from "@/components/search-comp/SwipeTabs";
import SwipeableResultsView from "@/components/search-comp/SwipeableResultsView";

const { width } = Dimensions.get("window");

const Results: FC = () => {
  const { search, domainData, tab } = useGlobalSearchParams<{
    search: string;
    domainData: string;
    tab?: string;
  }>();

  const [isItem, setIsItem] = useState(tab !== "stores");
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  const [foodDetails] = useState({
    visible: false,
  });

  const snapPoints = useMemo(() => ["50%", "70%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
    ),
    []
  );

  const searchInput = useMemo(
    () => ({
      lat: selectedDetails?.lat || 0,
      lon: selectedDetails?.lng || 0,
      pincode: selectedDetails?.pincode || "110001",
      query: search || "",
      domain: domainData || "",
    }),
    [selectedDetails, search, domainData]
  );

  const pageSize = 10;

  const { data: initialProductsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["searchProductsInitial", searchInput],
    queryFn: () => searchProducts({ ...searchInput, groupbystore: true, size: pageSize }),
    enabled: !!search && !!selectedDetails?.lat && !!selectedDetails?.lng,
  });

  const { data: initialStoresData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["searchStoresInitial", searchInput],
    queryFn: () => searchStores({ ...searchInput, size: pageSize }),
    enabled: !!search && !!selectedDetails?.lat && !!selectedDetails?.lng,
  });

  const translateX = useRef(new Animated.Value(isItem ? 0 : -width)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isItem ? 0 : -width,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  }, [isItem]);

  const tabAnim = translateX.interpolate({
    inputRange: [-width, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const totalItems =
    initialProductsData?.buckets?.reduce(
      (sum , bucket) => sum + (bucket?.doc_count || 0),
      0
    ) || 0;

  if (isLoadingProducts || isLoadingStores) return <Loader />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Results</Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            router.push({ pathname: "/search/search", params: { domain: domainData } })
          }
          style={styles.searchBar}
        >
          <TextInput
            value={search}
            placeholder="Search for items..."
            style={styles.searchInput}
            editable={false}
          />
          <Feather name="search" size={20} color="#888" />
        </TouchableOpacity>

        <Text style={styles.resultsTitle}>Showing Results for {search}</Text>

        <SwipeTabs
          tabAnim={tabAnim}
          totalItems={totalItems}
          totalStores={initialStoresData?.total || 0}
          domainData={domainData}
          setIsItem={setIsItem}
        />
      </View>

      <SwipeableResultsView
        isItem={isItem}
        translateX={translateX}
        setIsItem={setIsItem}
        router={router}
        searchInput={searchInput}
        initialProductsData={initialProductsData}
        initialStoresData={initialStoresData}
        pageSize={pageSize}
        search={search}
      />

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: "#fff" }}
        backdropComponent={renderBackdrop}
      >
        {foodDetails?.visible && <FoodDetailsComponent foodDetails={foodDetails} />}
      </BottomSheet>
    </SafeAreaView>
  );
};

export default Results;
