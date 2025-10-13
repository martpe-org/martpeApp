import { Dimensions, StyleSheet } from "react-native";

const windowWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#7c5462",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  redSection: {
    backgroundColor: "#ff3c41",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  catList: {
    marginTop: 5,
  },
  whiteSection: {
    backgroundColor: "#f5f2f2",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  sectionHeaderWithLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  sectionTitleCentered: {
    fontSize: 20,
    fontWeight: "600",
    color: "#5A5555",
    marginHorizontal: 15,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#5A5555",
  },
  categoryList: {
    alignItems: "center",
    paddingHorizontal: 2, // Add padding to prevent overflow
  },
  categoryItem: {
    margin: 5,
    flexDirection: "column",
    alignItems: "center",
    maxWidth: windowWidth * 0.25, // Constrain width
  },
  categoryImage: {
    width: windowWidth * 0.2, // Slightly smaller to fit better
    height: windowWidth * 0.22, // Adjust height proportionally
    resizeMode: "contain",
  },
  categoryName: {
    marginTop: -9,
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    flexWrap: "wrap", // Allow text wrapping
    maxWidth: windowWidth * 0.2, // Constrain text width
  },

  // Two Column Grid Styles
  twoColumnGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginTop: 14,
  },
  gridCard: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridCardLeft: {
    marginRight: "2%",
  },
  gridCardRight: {
    marginLeft: "2%",
  },
  gridCardImage: {
    width: "100%",
    height: 120,
  },
  gridCardLabel: {
    padding: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },

  // Personal Care Section
  personalCareContainer: {
    flexDirection: "row",
    paddingHorizontal: 8,
  },
  personalCareCard: {
    marginRight: 12,
    alignItems: "center",
    marginTop: 10,
    maxWidth: 90, // Constrain card width
  },
  personalCareImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  personalCareImage: {
    width: 50,
    height: 50,
  },
  personalCareTitle: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 80,
    flexWrap: "wrap", // Allow text wrapping
  },

  // Home & Decor Section
  homeDecorContainer: {
    flexDirection: "row",
    paddingHorizontal: 8, 
    marginTop:10
  },
  homeDecorCard: {
    marginRight: 12,
    alignItems: "center",
    marginTop: 14,
    maxWidth: 180, // Constrain card width
  },
  homeDecorImageContainer: {
    width: 160, // Reduced from 200
    height: 160, // Reduced from 200
    backgroundColor: "#ffffff",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
  },
  homeDecorImage: {
    width: 140, // Reduced from 200
    height: 120, // Reduced from 150
    resizeMode: "contain", // Add resizeMode
  },
  homeDecorTitle: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
    fontWeight: "500",
    maxWidth: 90,
    flexWrap: "wrap", // Allow text wrapping
  },

  // Footer Section
  footerContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2563EB", // Blue color
    textAlign: "center",
    lineHeight: 28,
  },
  headerSubtitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 28,
  },
  greenText: {
    color: "#10B981", // Green color
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  cardsContainer: {
    gap: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  card: {
    flex: 1,
    backgroundColor: "#Ffff",
    padding: 15,
    borderRadius: 12,
    maxHeight: 150,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 20,
    marginHorizontal: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  nearbyList: {
    paddingHorizontal: 8, // Add horizontal padding
    paddingVertical: 8,
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
    marginHorizontal: 16, // Add horizontal margin
  },
  errorText: {
    color: "#c62828",
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: "#FF9130",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});
