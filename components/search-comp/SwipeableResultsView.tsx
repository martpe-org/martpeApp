import React, { FC, useRef, useState } from "react";
import { Animated, Dimensions, PanResponder, View } from "react-native";
import ProductResultsWrapper from "@/components/search-comp/ProductResultsWrapper";
import StoreResultsWrapper from "@/components/search-comp/StoreResultsWrapper";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

interface SwipeableResultsViewProps {
    isItem: boolean;
    translateX: Animated.Value;
    setIsItem: (val: boolean) => void;
    router: any;
    searchInput: any;
    initialProductsData: any;
    initialStoresData: any;
    pageSize: number;
    search: string;
}

const SwipeableResultsView: FC<SwipeableResultsViewProps> = ({
    isItem,
    translateX,
    setIsItem,
    router,
    searchInput,
    initialProductsData,
    initialStoresData,
    pageSize,
    search,
}) => {
    const currentOffset = useRef(isItem ? 0 : -width);
    const [isAnimating] = useState(false); // 🚀 prevent double trigger



    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) =>
                Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy),
            onPanResponderMove: (_, g) => {
                if (isAnimating) return; // 🚫 block while animating
                const newX = currentOffset.current + g.dx;
                if (newX <= 0 && newX >= -width) translateX.setValue(newX);
            },
            onPanResponderRelease: (_, g) => {
                if (isAnimating) return;

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

                // ✅ Immediate tab activation
                setIsItem(nextIsItem);
                router.setParams({ tab: nextIsItem ? "items" : "stores" });

                // Animate smoothly in parallel
                Animated.spring(translateX, {
                    toValue,
                    useNativeDriver: true,
                    bounciness: 8,
                    speed: 12,
                }).start(() => {
                    currentOffset.current = toValue;
                });
            },


        })
    ).current;

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{
                flexDirection: "row",
                width: width * 2,
                flex: 1,
                transform: [{ translateX }],
            }}
        >
            {/* ITEMS */}
            <View style={{ width }}>
                <ProductResultsWrapper
                    initialData={initialProductsData?.buckets || []}
                    pageSize={pageSize}
                    searchParams={{
                        query: search || "",
                        lat: searchInput.lat,
                        lon: searchInput.lon,
                        pincode: searchInput.pincode,
                        domain: searchInput.domain,
                    }}
                />
            </View>

            {/* STORES */}
            <View style={{ width }}>
                <StoreResultsWrapper
                    initialData={initialStoresData?.results || []}
                    total={initialStoresData?.total || 0}
                    pageSize={pageSize}
                    searchParams={{
                        query: search || "",
                        lat: searchInput.lat,
                        lon: searchInput.lon,
                        pincode: searchInput.pincode,
                        domain: searchInput.domain,
                    }}
                />
            </View>
        </Animated.View>
    );
};

export default SwipeableResultsView;
