import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
  },
  issueIdRow: {
    flexDirection: "row",
  },
  issueIdLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  issueIdValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    marginTop: 16,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    color: "#000",
  },
  storeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  storeIcon: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 4,
  },
  storeTextContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 2,
  },
  storeAddress: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    color: "#000",
    marginRight: 8,
    fontWeight: "400",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#070707ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
  },
  itemText: {
    fontSize: 16,
    color: "#000",
    marginBottom: 10,
  },
viewOrderButton: {
  backgroundColor: "#fff",
  paddingVertical: 12,
  borderRadius: 60,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#ddd",
  // Elevation for Android
  elevation: 4,
},
viewOrderButtonText: {
  color: "#000",
  fontSize: 16,
  fontWeight: "700",
},

  timeLabel: {
    fontSize: 16,
    fontWeight: "400",
    color: "#000",
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "400",
  },
  imagesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  descriptionImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
});