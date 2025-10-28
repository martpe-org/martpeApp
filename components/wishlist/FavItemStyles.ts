import { Dimensions, StyleSheet } from "react-native";
const { width: screenWidth } = Dimensions.get("window");
const cardWidth = (screenWidth - 36) / 2;
export const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 14,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: cardWidth,
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 15,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  heartIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 4,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: cardWidth * 0.8,
    borderRadius: 10,
    backgroundColor: "#F8F8F8",
    marginBottom: 6,
  },
  itemInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  vegIndicator: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  vegDot: {
    width: 7,
    height: 7,
    borderRadius: 50,
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#222",
    lineHeight: 18,
    flexShrink: 1,
  },
  provider: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  fullAddContainer: {
    marginTop: "auto",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingVertical: 6,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: "#2D3748",
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
  },
});