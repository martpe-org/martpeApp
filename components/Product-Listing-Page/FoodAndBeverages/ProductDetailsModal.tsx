import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    SafeAreaView,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { FetchProductDetail } from "@/components/search/search-products-type";
import { fetchProductDetails } from "@/components/product/fetch-product";
import LikeButton from "@/components/common/likeButton";
import ImageComp from "@/components/common/ImageComp";
import AddToCart from "@/components/common/AddToCart";
import Loader from "@/components/common/Loader";
import ShareButton from "@/components/common/Share";
import { styles } from "./ProductDetailsModal.styles";


interface ProductDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    productSlug?: string;
}


interface ErrorState {
    message: string;
    retry?: boolean;
}


const ProductDetailsModal: FC<ProductDetailsModalProps> = ({
    visible,
    onClose,
    productSlug,
}) => {
    const [productData, setProductData] = useState<FetchProductDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ErrorState | null>(null);
    const [refreshing, setRefreshing] = useState(false);


    const fetchData = useCallback(
        async (showLoader = true) => {
            if (!productSlug) {
                setError({ message: "Product slug is required", retry: false });
                setIsLoading(false);
                return;
            }


            try {
                if (showLoader) setIsLoading(true);
                setError(null);


                const response = await fetchProductDetails(productSlug);
                if (response) {
                    setProductData(response);
                } else {
                    setError({
                        message: "Product not found or unavailable",
                        retry: true,
                    });
                }
            } catch (err) {
                setError({
                    message: "Failed to load product details. Please check your connection.",
                    retry: true,
                });
            } finally {
                setIsLoading(false);
                setRefreshing(false);
            }
        },
        [productSlug]
    );


    useEffect(() => {
        if (visible && productSlug) {
            fetchData();
        }
    }, [visible, productSlug, fetchData]);


    useEffect(() => {
        if (!visible) {
            setProductData(null);
            setError(null);
            setIsLoading(true);
        }
    }, [visible]);





    const handleRetry = useCallback(() => {
        fetchData();
    }, [fetchData]);


    const pricing = useMemo(() => {
        if (!productData) return null;


        const price =
            productData.price.value === 0
                ? Number(productData.price.default_selection?.value) ||
                Number(productData.price.range?.lower) ||
                productData.priceRangeDefault ||
                0
                : productData.price.value;


        const maxPrice = productData.price.maximum_value || 0;
        const discount = productData.price.offerPercent || 0;


        return { price, maxPrice, discount };
    }, [productData]);


    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.productName} numberOfLines={1}>
                {productData?.name || "Product Details"}
            </Text>
        </View>
    );


    const renderError = () => (
        <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error?.message}</Text>
            {error?.retry && (
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                    <Text style={styles.retryButtonText}>Tap to retry</Text>
                </TouchableOpacity>
            )}
        </View>
    );


    const renderProductImage = () => {
        if (!productData?.images?.length) return null;


        const firstImage = productData.images[0];


        return (
            <View style={styles.imageWrapper}>
                <ImageComp
                    source={firstImage}
                    imageStyle={styles.image}
                    resizeMode="cover"
                    fallbackSource={{ uri: "https://picsum.photos/300/300" }}
                    loaderColor="#666"
                    loaderSize="small"
                />


                <View
                    style={styles.overlayButtons}
                    pointerEvents="box-none"
                >
                    <LikeButton
                        productId={productSlug}
                        color="#E11D48"
                    />
                    <ShareButton
                        productId={productSlug}
                        productName={productData.name}
                        storeName={productData.store?.name || "Unknown Store"}
                        type="item"
                    />
                </View>
            </View>
        );
    };



    const renderPricing = () => {
        if (!pricing) return null;


        return (
            <View style={styles.pricingContainer}>
                <Text style={styles.productNameBottom} numberOfLines={1}>
                    {productData?.name || "Product Details"}
                </Text>
                <View style={styles.priceRow}>
                    <View style={styles.priceInfo}>
                        {pricing.maxPrice > pricing.price && (
                            <Text style={styles.strikePrice}>₹ {Math.ceil(pricing.maxPrice)}</Text>
                        )}
                        <Text style={styles.finalPrice}>₹ {Math.ceil(pricing.price)}</Text>
                    </View>


                    {typeof pricing?.discount === "number" && pricing.discount > 0 && (
                        <Text style={styles.discount}>
                            {Math.ceil(pricing.discount)}% OFF
                        </Text>
                    )}
                </View>
            </View>
        );
    };


    const renderAddToCart = () => {
        if (!productData) return null;


        return (
            <View style={styles.addToCartContainer}>
                <AddToCart
                    storeId={productData.store_id}
                    slug={productSlug || productData.slug}
                    catalogId={productData.catalog_id}
                    price={pricing?.price || 0}
                    productName={productData.name}
                    customizable={productData.customizable}
                    directlyLinkedCustomGroupIds={
                        productData.directlyLinkedCustomGroupIds || []
                    }
                />
            </View>
        );
    };


    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <SafeAreaView style={styles.container}>
                        {renderHeader()}


                        {isLoading ? (
                            <View style={styles.loaderContainer}>
                                <Loader />
                            </View>
                        ) : error ? (
                            renderError()
                        ) : !productData ? (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>Product information unavailable</Text>
                            </View>
                        ) : (
                            <ScrollView
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {renderProductImage()}
                                {renderPricing()}
                                {renderAddToCart()}
                            </ScrollView>
                        )}
                    </SafeAreaView>
                </View>
            </View>
        </Modal>
    );
};


export default ProductDetailsModal;