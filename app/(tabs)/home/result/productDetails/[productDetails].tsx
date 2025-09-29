import { useGlobalSearchParams, useRouter } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AddToCart from "../../../../../components/common/AddToCart";
import Loader from "../../../../../components/common/Loader";
import Search from "../../../../../components/common/Search";
import { fetchProductDetails } from "../../../../../components/product/fetch-product";
import { FetchProductDetail } from "../../../../../components/product/fetch-product-type";
import ImageCarousel from "../../../../../components/ProductDetails/ImageCarousel";
import MoreBySeller from "../../../../../components/ProductDetails/MoreBySeller";
import ProductHeader from "../../../../../components/ProductDetails/ProductHeader";
import ProductPricing from "../../../../../components/ProductDetails/ProductPricing";
import SellerDetails from "../../../../../components/ProductDetails/Seller";
import Services from "../../../../../components/ProductDetails/Services";
import VariantGroup from "../../../../../components/variants/VariantGroup";
import { styles } from "./pdpStyles";

// Constants
const DEFAULT_RETURN_DAYS = 10;
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
    router.push("/search/search");
  };

 const renderHeader = () => (
  <SafeAreaView style={styles.safeHeader}>
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={20} color="black" />
      </TouchableOpacity>
      <View style={styles.searchWrapper}>
        <Search onPress={handleSearchPress} />
      </View>
    </View>
  </SafeAreaView>
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
        {productData && (
          <AddToCart
            storeId={productData.store_id}
            slug={productData.slug}
            catalogId={productData.catalog_id}
            price={productData.price?.value || 0}
            productName={productData.name} // ✅ Add this line
            customizable={productData.customizable}
            directlyLinkedCustomGroupIds={
              productData.directlyLinkedCustomGroupIds || []
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;
