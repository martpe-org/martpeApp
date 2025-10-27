import { StyleSheet, Dimensions } from "react-native";


const { height: screenHeight } = Dimensions.get("window");


export const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContainer: {
        height: screenHeight * 0.55,
    },
    likeButtonWrapper: {
  backgroundColor: "rgba(255,255,255,0.95)", // subtle white background
  borderRadius: 20,
  padding: 6,
  elevation: 3, // Android shadow
  shadowColor: "#000", // iOS shadow
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
},

    container: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f1f1",
    },
    closeButton: {
        padding: 4,
    },
    productName: {
        flex: 1,
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
        textAlign: "center",
        marginHorizontal: 12,
    },
    productNameBottom: {
        flex: 1,
        fontSize: 14,
        fontWeight: "400",
        color: "#000",
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    imageWrapper: {
        width: "100%",
        height: 220,
        marginBottom: 12,
    },
    image: {
        width: "100%",
        height: "100%",
    },
    overlayButtons: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        gap: 10,
    },
    pricingContainer: {
        paddingHorizontal: 16,
        paddingVertical:10,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f1f1",
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
                paddingVertical:10,

    },
    priceInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    strikePrice: {
        fontSize: 16,
        color: "#868e96",
        textDecorationLine: "line-through",
    },
    finalPrice: {
        fontSize: 18,
        fontWeight: "600",
        color: "green",
    },
    discount: {
        fontSize: 12,
        fontWeight: "500",
        color: "#F13A3A",
        backgroundColor: "#F9F3F2",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginRight:150
    },
    addToCartContainer: {
        paddingHorizontal: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: "#6c757d",
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});