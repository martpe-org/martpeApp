import { Dimensions, StyleSheet } from "react-native";
import { Colors } from "../../../../theme";
const { width } = Dimensions.get("window");
 export const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE_COLOR,
    flex: 1,
  },
  header: {
    backgroundColor: Colors.WHITE_COLOR,
    paddingBottom: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
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
  
  // Like button container (top-right)
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
  
  // Product card discount badge
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
  
  // Store card wrapper for positioning
  storeCardWrapper: {
    position: "relative",
    marginBottom: 12,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
  },
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
  contentContainer: {
    flexGrow: 1,
  },
  resultsTitle: {
    fontSize: 14,
    color: "#666",
    margin: 16,
    textTransform: "capitalize",
  },
  noResultsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 40,
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
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 9,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  storeImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
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
    marginBottom: 2,
  },
  offerText: {
    fontSize: 12,
    color: "#0d470f",
    fontWeight: "500",
  },
  productsContainer: {
    paddingLeft: 4,
  },
  productCard: {
    width: width * 0.6,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productInfo: {
    padding: 12,
  },
  vegIndicator: {
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  vegDot: {
    color: "#4CAF50",
    fontSize: 16,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
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
    justifyContent: "space-between",
    alignItems: "center",
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