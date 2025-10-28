import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },
  carousel: {
    flexDirection: "row",
    flex: 1,
  },
  pane: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    width: "100%",
  },
  errorText: {
    fontSize: 18,
    color: "#E53E3E",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
