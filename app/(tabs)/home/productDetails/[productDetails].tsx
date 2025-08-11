import { useGlobalSearchParams } from "expo-router";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AddToCart from "../../../../components/ProductDetails/AddToCart";
import ImageCarousel from "../../../../components/ProductDetails/ImageCarousel";
import MoreBySeller from "../../../../components/ProductDetails/MoreBySeller";
import ProductHeader from "../../../../components/ProductDetails/ProductHeader";
import ProductPricing from "../../../../components/ProductDetails/ProductPricing";
import SellerDetails from "../../../../components/ProductDetails/Seller";
import Services from "../../../../components/ProductDetails/Services";
import VariantGroup from "../../../../components/ProductDetails/VariantGroup";
import Loader from "../../../../components/common/Loader";
import Search from "../../../../components/common/Search";
import { fetchProductDetails } from "../../../../components/product/fetch-product";
import { FetchProductDetail } from "../../../../components/product/fetch-product-type";

interface ProductDetailsParams {
  productDetails: string;
  [key: string]: string;
}

const ProductDetails: FC = () => {
  const { productDetails } = useGlobalSearchParams<ProductDetailsParams>();

  const [productData, setProductData] = useState<FetchProductDetail | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Memoized values to prevent unnecessary re-renders
  const maxLimit = useMemo(() => {
    if (!productData) return 1;
    return Math.min(
      productData.quantity ?? 1,
      100 // default fallback
    );
  }, [productData]);

  const storeAddress = useMemo(() => {
    if (!productData?.store?.address) return "";
    const { locality, city, state } = productData.store.address;
    return [locality, city, state].filter(Boolean).join(", ");
  }, [productData?.store?.address]);

  // Fetch product data function
  const fetchData = useCallback(
    async (showLoader = true) => {
      if (!productDetails) {
        setError("Product ID is required");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoader) setIsLoading(true);
        setError(null);

        const response = await fetchProductDetails(productDetails);
        console.log(`Product details response:`, response);

        if (response) {
          setProductData(response);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details. Please try again.");
      } finally {
        setIsLoading(false);
        setRefreshing(false);
      }
    },
    [productDetails]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(false);
  }, [fetchData]);

  const handleRetry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Search
            placeholder="Search for anything.."
            showBackArrow
            showLocation={false}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryButton} onPress={handleRetry}>
            Tap to retry
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!productData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Search
            placeholder="Search for anything.."
            showBackArrow
            showLocation={false}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Product not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Search
          placeholder="Search for anything.."
          showBackArrow
          showLocation={false}
        />
      </View>

      <ProductHeader
        itemName={productData.name}
        category={productData.category}
        storeName={productData.store?.name || "Unknown Store"}
        productId={productDetails}
        quantity={Number(productData.unitized?.measure?.value) || 0} // ✅ Safe number
        unit={productData.unitized?.measure?.unit || ""}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        {(productData.images?.length ?? 0) > 0 && (
          <ImageCarousel url={productData.images!} /> // ✅ Non-null assertion after check
        )}

      <ProductPricing
  storeName={productData.store?.name || "Unknown Store"}
  storeId={productData.store_id}
  description={productData.short_desc || "No description available"}
  maxPrice={productData.price?.maximum_value ?? 0} // ✅ always a number
  price={productData.price?.value || 0}
  discount={productData.price?.offerPercent || 0}
/>


        {/* Variant Group */}
        {productData.parent_item_id &&
          Array.isArray(productData.variants) &&
          productData.variants.length > 0 && (
            <VariantGroup
              slug={productData.slug}
              parentId={productData.parent_item_id}
              storeId={productData.store_id}
              initialPrimaryVariant={
                (productData.unitized?.measure?.value || "") +
                (productData.unitized?.measure?.unit || "")
              }
              variants={productData.variants}
              selectedProductId={productDetails}
            />
          )}

        {/* Services */}
        <Services
          productId={productDetails}
          storeId={productData.store_id}
          returnableDays={
            productData.meta?.return_window
              ? parseInt(productData.meta.return_window.replace(/\D/g, "")) || 10
              : 10
          }
          isReturnable={productData.meta?.returnable || false}
          isCashOnDeliveryAvailable={productData.meta?.available_on_cod || false}
        />

        {/* More by Store */}
        {Array.isArray(productData.offers) && productData.offers.length > 0 && (
          <MoreBySeller
            originalId={productDetails}
            products={productData.offers.map((offer) => ({
              id: offer._id,
              descriptor: {
                name: offer.short_desc,
                images: offer.images || [],
              },
              price: {
                value: parseFloat(offer.benefit?.value || "0"),
                maximum_value: parseFloat(offer.qualifier?.min_value || "0"),
                offer_percent: 0,
              },
            }))}
            sellerName={productData.store?.name || ""}
            sellerDetails={storeAddress}
            sellerSymbol={productData.store?.symbol || ""}
            sellerContact={productData.meta?.contact_details_consumer_care || ""}
          />
        )}

        {/* Store Details */}
        <SellerDetails
          sellerName={productData.store?.name || "Unknown Store"}
          sellerDetails={storeAddress || "No address available"}
          sellerSymbol={productData.store?.symbol || ""}
          sellerContact={
            productData.meta?.contact_details_consumer_care ||
            "Contact information not available"
          }
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Add to Cart */}
      <View style={styles.stickyFooter}>
        <AddToCart
  storeId={productData.store_id}
  slug={String(productDetails)} // Pass as slug instead of itemId
  catalogId={productData.catalog_id} // Ensure you have this from API
  price={productData.price?.value || 0}
  maxLimit={maxLimit}
/>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  scrollView: {
    flex: 1,
  },
  stickyFooter: {
    position: "absolute",
    bottom: 5,
    left: 10,
    right: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },
  retryButton: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
