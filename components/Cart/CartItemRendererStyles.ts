import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailableItem: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E2E8F0",
    opacity: 0.7,
  },
  imageContainer: {
    marginRight: 12,
    position: "relative",
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  unavailableImage: {
    opacity: 0.5,
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  unavailableOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  unavailableText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  productInfo: {
    flex: 1,
    flexDirection: "column",
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 8,
  },
  name: {
    fontWeight: "700",
    fontSize: 14,
    color: "#1A202C",
  },
  unavailableName: {
    color: "#718096",
  },
  unavailableLabel: {
    fontSize: 11,
    color: "#E53E3E",
    fontWeight: "500",
    marginBottom: 4,
  },
  customizationsContainer: {
    marginBottom: 6,
    paddingVertical: 2,
  },
  customizationsLabel: {
    fontSize: 11,
    color: "#4A5568",
    fontWeight: "600",
    marginBottom: 2,
  },
  customizationText: {
    fontSize: 10,
    color: "#718096",
    lineHeight: 14,
  },
  moreCustomizationsText: {
    fontSize: 10,
    color: "#A0AEC0",
    fontStyle: "italic",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  price: {
    color: "#4A5568",
    fontSize: 12,
  },
  unavailablePrice: {
    color: "#A0AEC0",
  },
  total: {
    fontWeight: "600",
    fontSize: 13,
    color: "#2F855A",
  },
  quantity: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});