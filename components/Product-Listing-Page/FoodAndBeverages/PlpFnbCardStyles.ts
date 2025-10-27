import { StyleSheet } from "react-native";
export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
    flex: 1,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3C8A3C",
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: "#8B94B2",
  },
  discount: {
    fontSize: 12,
    fontWeight: "500",
    color: "#F13A3A",
    backgroundColor: "#F9F3F2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  description: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  imageContainer: {
    width: 100,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  topActions: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: 16,
    padding: 4,
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

  addToCartWrapper: {
    marginTop: -8,
    width: "100%",
  },
  cartWrapper: {
    width: "100%",
  },
  errorText: {
    fontSize: 10,
    color: "#ff6b6b",
    textAlign: "center",
    fontWeight: "500",
  },
  outOfStockText: {
    fontSize: 11,
    color: "#999",
    textAlign: "center",
    fontWeight: "500",
    marginTop: 4,
  },
});