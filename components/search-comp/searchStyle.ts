import { Colors } from "@/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // Container
  container: {
    backgroundColor: Colors.WHITE_COLOR,
    flex: 1,
  },

  // Header
  header: {
    backgroundColor: Colors.WHITE_COLOR,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
  resultsTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontWeight: "600",
  },

  // Tabs
  tabs: {
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: 20,
  },
  activeTab: {
    borderWidth: 2,
    backgroundColor: "#FB3E44",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1f0404",
  },
  activeTabText: {
    color: "#ecdedf",
  },

  // Content
  contentContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  // Infinite scroll / list
  listContainer: {
    padding: 8,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessage: {
    paddingVertical: 20,
    alignItems: "center",
  },
  endMessageText: {
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    margin: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#FB3E44",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },

  // Card styles
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  // Store card
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  storeDetails: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeMetrics: {
    fontSize: 12,
    color: "#666",
  },
  visitStoreButton: {
    backgroundColor: "#f5f5f5",
    padding: 8,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Product carousel
  productsCarousel: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    padding: 8,
    marginTop: 4,
  },
  productsContainer: {
    paddingLeft: 4,
  },
  productCard: {
    width: width * 0.38,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImage: {
    width: "100%",
    height: 100,
  },
  productInfo: {
    padding: 12,
  },
  vegIndicator: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  vegDot: {
    fontSize: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  originalPrice: {
    fontSize: 12,
    color: "#999",
    textDecorationLine: "line-through",
    marginLeft: 6,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },

  // Discount & Like
  discountBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#E11D48",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 2,
    elevation: 3,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  likeButtonContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  productDiscountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#E11D48",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 1,
  },
  productDiscountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Store grid
  storeGrid: {
    flex: 1,
    paddingHorizontal: 8,
  },
  storeListContainer: {
    padding: 8,
  },
  storeRow: {
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  gridStoreCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    margin: 4,
    width: (width - 48) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeImageContainer: {
    position: "relative",
    alignItems: "center",
    marginBottom: 8,
  },
  gridStoreImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  offerBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#E11D48",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 1,
  },
  offerBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  gridStoreInfo: {
    alignItems: "center",
  },
  gridStoreName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 18,
  },
  storeMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  storeDistance: {
    fontSize: 12,
    color: "#666",
  },
  storeTime: {
    fontSize: 12,
    color: "#666",
  },
  storeLocation: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginBottom: 4,
  },
  ratingContainer: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
  },

  // Legacy styles for backward compatibility
  offerText: {
    fontSize: 12,
    color: "#0d470f",
    fontWeight: "500",
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  storeCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  storeCardInfo: {
    flex: 1,
  },
  storeCardName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  storeCardDetails: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  storeCardAddress: {
    fontSize: 12,
    color: "#888",
  },
  
});
