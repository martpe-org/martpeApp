/* cat.css */
import {  StyleSheet } from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  unserviceableContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 30,
  },
  animationContainer: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  lottieAnimation: {
    width: widthPercentageToDP("100%"),
    backgroundColor: "#fff",
  },
  messageContainer: {
    height: 50,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  unserviceableText: {
    color: "#909095",
    fontWeight: "500",
    textAlign: "center",
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#030303",
    width: widthPercentageToDP("90%"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 20,
  },
  secondaryButton: {
    borderColor: "#030303",
    width: widthPercentageToDP("90%"),
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
    alignItems: "center",
    borderWidth: 2,
    marginVertical: 10,
  },
  secondaryButtonText: {
    color: "#030303",
    fontWeight: "600",
    fontSize: 20,
  },
  bottomSheetIndicator: {
    backgroundColor: "#fff",
  },
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
  },
});