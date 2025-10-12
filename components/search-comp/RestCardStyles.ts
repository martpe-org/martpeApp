import { StyleSheet, Dimensions } from "react-native";
const { width } = Dimensions.get("window");

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    overflow: "hidden",
  },
  offerBadgeContainer: {
    position: "absolute",
    top: 8,
    left: 8,
    zIndex: 5,
  },
  likeButtonContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 5,
  },
  // New sticky product text container
  stickyProductContainer: {
    position: "absolute",
    bottom: 100, // Above store info container
    left: 0,
    right: 80, // Leave space for time container
    backgroundColor: "rgba(85, 82, 82, 0.7)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  stickyProductText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  // Sticky time container
  stickyTimeContainer: {
    position: "absolute",
    bottom: 105, // Same level as product text
    right: 1,
    backgroundColor: "#00C851", // bright green
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  productCard: {
    width: width,
    height: 170,
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#f8f8f8",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.1)", // Very light overlay for consistency
  },
  overlayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  timeContainer: {
    backgroundColor: "#00C851",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  storeInfoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  storeAddress: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  topProductsText: {
    fontSize: 12,
    color: "#555",
    marginTop: 2,
    fontStyle: "italic",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  openText: {
    fontSize: 13,
    color: "#00C851",
    fontWeight: "600",
  },
  distanceText: {
    fontSize: 13,
    color: "#FF8C00",
    fontWeight: "500",
  },
});
