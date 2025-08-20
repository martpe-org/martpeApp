import { useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
} from "react-native";

import AddToCart from "../../../../../components/ProductDetails/AddToCart";
import ImageCarousel from "../../../../../components/ProductDetails/ImageCarousel";
import MoreBySeller from "../../../../../components/ProductDetails/MoreBySeller";
import ProductHeader from "../../../../../components/ProductDetails/ProductHeader";
import ProductPricing from "../../../../../components/ProductDetails/ProductPricing";
import SellerDetails from "../../../../../components/ProductDetails/Seller";
import Services from "../../../../../components/ProductDetails/Services";
import VariantGroup from "../../../../../components/ProductDetails/VariantGroup";
import Loader from "../../../../../components/common/Loader";
import Search from "../../../../../components/common/Search";
import { fetchProductDetails } from "../../../../../components/product/fetch-product";
import { FetchProductDetail } from "../../../../../components/product/fetch-product-type";
import { useRouter } from "expo-router";
import { Entypo } from "@expo/vector-icons";

// Constants
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CART_FOOTER_HEIGHT = 80;
const DEFAULT_RETURN_DAYS = 10;

// Types
interface ProductDetailsParams {
  productDetails: string;
  [key: string]: string;
}

interface ErrorState {
  message: string;
  retry?: boolean;
}

const ProductDetails: FC = () => {
  const { productDetails } = useGlobalSearchParams<ProductDetailsParams>();

  // State management
  const [productData, setProductData] = useState<FetchProductDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const formattedStoreAddress = useMemo(() => {
    if (!productData?.store?.address) return "";

    const { locality, city, state } = productData.store.address;
    const addressParts = [locality, city, state].filter(Boolean);
    return addressParts.join(", ");
  }, [productData?.store?.address]);

  const productQuantityDisplay = useMemo(() => {
    const quantity = Number(productData?.unitized?.measure?.value) || 0;
    const unit = productData?.unitized?.measure?.unit || "";
    return { quantity, unit };
  }, [productData?.unitized?.measure]);

  const returnableDays = useMemo(() => {
    if (!productData?.meta?.return_window) return DEFAULT_RETURN_DAYS;

    const days = parseInt(
      productData.meta.return_window.replace(/\D/g, ""),
      10
    );
    return isNaN(days) ? DEFAULT_RETURN_DAYS : days;
  }, [productData?.meta?.return_window]);

  // Data fetching function
  const fetchData = useCallback(
    async (showLoader = true) => {
      if (!productDetails) {
        setError({ message: "Product ID is required", retry: false });
        setIsLoading(false);
        return;
      }

      try {
        if (showLoader) setIsLoading(true);
        setError(null);

        const response = await fetchProductDetails(productDetails);

        if (response) {
          setProductData(response);
          console.log("Product details loaded successfully:", response.name);
        } else {
          setError({
            message: "Product not found or unavailable",
            retry: true,
          });
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError({
          message:
            "Failed to load product details. Please check your connection.",
          retry: true,
        });
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [productDetails]
  );

  // Effect hooks
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);
  const handleSearchPress = () => {
    router.push("/search");
  };

  // Render functions
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Entypo name="chevron-left" size={22} color="#111" />
      </TouchableOpacity>
      <View style={styles.searchWrapper}>
        <Search onPress={handleSearchPress} />
      </View>
    </View>
  );

  const renderError = () => (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error?.message}</Text>
        {error?.retry && (
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Tap to retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const renderImageCarousel = () => {
    if (!productData?.images?.length) return null;

    return (
      <View style={styles.imageCarouselContainer}>
        <ImageCarousel url={productData.images} />
      </View>
    );
  };

  const renderVariantGroup = () => {
    if (
      !productData?.parent_item_id ||
      !Array.isArray(productData.variants) ||
      productData.variants.length === 0
    ) {
      return null;
    }

    const initialVariant = `${productQuantityDisplay.quantity}${productQuantityDisplay.unit}`;

    return (
      <View style={styles.sectionContainer}>
        <VariantGroup
          slug={productData.slug}
          parentId={productData.parent_item_id}
          storeId={productData.store_id}
          initialPrimaryVariant={initialVariant}
          variants={productData.variants}
          selectedProductId={productDetails!}
        />
      </View>
    );
  };

  const renderMoreBySeller = () => {
    if (
      !Array.isArray(productData?.offers) ||
      productData.offers.length === 0
    ) {
      return null;
    }

    const transformedProducts = productData.offers.map((offer) => ({
      id: offer._id,
      descriptor: {
        name: offer.short_desc || "Product",
        images: offer.images || [],
      },
      price: {
        value: parseFloat(offer.benefit?.value || "0"),
        maximum_value: parseFloat(offer.qualifier?.min_value || "0"),
        offer_percent: 0,
      },
    }));

    return (
      <View style={styles.sectionContainer}>
        <MoreBySeller
          originalId={productDetails!}
          products={transformedProducts}
          sellerName={productData.store?.name || ""}
          sellerDetails={formattedStoreAddress}
          sellerSymbol={productData.store?.symbol || ""}
          sellerContact={productData.meta?.contact_details_consumer_care || ""}
        />
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return <Loader />;
  }

  // Error state
  if (error) {
    return renderError();
  }

  // No data state
  if (!productData) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product information unavailable</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ProductHeader
        itemName={productData.name}
        category={productData.category}
        storeName={productData.store?.name || "Unknown Store"}
        productId={productDetails!} // product slug/id
        quantity={productQuantityDisplay.quantity}
        unit={productQuantityDisplay.unit}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007AFF"]}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderImageCarousel()}

        <View style={styles.sectionContainer}>
          <ProductPricing
            store={{
              name: productData.store?.name || "Unknown Store",
              slug: productData.store?.slug || "unknown-store",
            }}
            description={productData.short_desc || "No description available"}
            maxPrice={productData.price?.maximum_value ?? 0}
            price={productData.price?.value || 0}
            discount={productData.price?.offerPercent || 0}
          />
        </View>
        {renderVariantGroup()}

        <View style={styles.sectionContainer}>
          <Services
            productId={productDetails!}
            storeId={productData.store_id}
            returnableDays={returnableDays}
            isReturnable={productData.meta?.returnable || false}
            isCashOnDeliveryAvailable={
              productData.meta?.available_on_cod || false
            }
          />
        </View>

        {renderMoreBySeller()}

        <View style={styles.sectionContainer}>
          <SellerDetails
            sellerName={productData.store?.name || "Unknown Store"}
            sellerDetails={formattedStoreAddress || "No address available"}
            sellerSymbol={productData.store?.symbol || ""}
            sellerContact={
              productData.meta?.contact_details_consumer_care ||
              "Contact information not available"
            }
          />
        </View>

        {/* Bottom padding to account for sticky footer */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Sticky Add to Cart Footer */}
      <View style={styles.stickyFooter}>
        <AddToCart
          storeId={productData.store_id}
          slug={String(productDetails)}
          catalogId={productData.catalog_id}
          price={productData.price?.value || 0}
        />
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f3f3",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  backButton: {
    padding: 6,
    marginTop: 14,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },

  searchWrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  sectionContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageCarouselContainer: {
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CART_FOOTER_HEIGHT,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E5E7EB",
  },
  bottomPadding: {
    height: CART_FOOTER_HEIGHT + 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
