import { useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Loader from "../../../../../components/common/Loader";

import ImageCarousel from "../../../../../components/ProductDetails/ImageCarousel";
import ProductPricing from "../../../../../components/ProductDetails/ProductPricing";
import SellerDetails from "../../../../../components/ProductDetails/Seller";
import Services from "../../../../../components/ProductDetails/Services";
import VariantGroup from "../../../../../components/variants/VariantGroup";
import { styles } from "./pdpStyles";
import { FetchProductDetail } from "@/components/search/search-products-type";
import { fetchProductDetails } from "@/components/product/fetch-product";
import ProductBottomDetail from "@/components/ProductDetails/ProductBottomDetail";

// Constants
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

  const productQuantityDisplay = useMemo(() => {
    const quantity = Number(productData?.unitized?.measure?.value) || 0;
    const unit = productData?.unitized?.measure?.unit || "";
    return { quantity, unit };
  }, [productData?.unitized?.measure]);


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



  const renderError = () => (
    <SafeAreaView style={styles.container}>
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
        <ImageCarousel
          url={productData.images}
          productId={productDetails!}
          productName={productData.name}
          storeName={productData.store?.name || "Unknown Store"}
        />
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Product information unavailable
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main render
  return (
    <SafeAreaView style={styles.container}>

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
        {/* Image Carousel */}
        {renderImageCarousel()}
        {/* Pricing Section */}
        <View style={styles.sectionContainer}>
          {productData && <ProductPricing product={productData} />}
        </View>
        {/* Variants Section */}
        {renderVariantGroup()}

        <View style={styles.sectionContainer}>
          <Services product={productData} />
        </View>
        {/* Seller Details Section */}
        <View style={styles.sectionContainer}>
          <SellerDetails product={productData} />
        </View>
        {productData && <ProductBottomDetail product={productData} />}

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;