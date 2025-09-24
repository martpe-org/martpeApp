import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;

export const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flexGrow: 1, backgroundColor: "#fff" },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
  },
  section: { marginHorizontal: 10, marginBottom: 20 },
  subCategories: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  backButton: { marginRight: 12, padding: 4, marginTop: -20 },
  searchWrapper: { flex: 1, marginTop: -20 },
  subCategory: {
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    width: (screenWidth - 80) / 4,
  },
subCategoryImage: {
  width: 85,
  height: 85,
  borderRadius: 20,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 6,
  elevation: 5,

  // ✅ Glassy border effect
  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 0.6)",
},

subCategoryIcon: {
  width: 55,
  height: 55,
  borderRadius: 12,
},

  subHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 25,
  },
  subHeadingTextUp: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#b61616",
    marginHorizontal: 10,
  },
  subHeadingText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
    textAlign: "center",
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-end",
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: -17,
    marginBottom: -15,
  },
  viewMoreButtonText: { color: "#F13A3A", fontSize: 12, fontWeight: "500" },
  noStoresContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 120,
  },
  animatedContent: { alignItems: "center", justifyContent: "center" },
  animatedText: {
    fontSize: 16,
    color: "#555",
    marginTop: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  subCategoryName: {
    fontSize: 12,
    fontWeight: "400",
    color: "#333",
    textAlign: "center",
  },
  offersContainer: {
    height: 200,
    marginVertical: 15,
    paddingHorizontal: 5,
  },
  noRestaurantsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    minHeight: 120,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "500",
  },

});
