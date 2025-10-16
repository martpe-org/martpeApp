import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#fff",
  },
// Counter sitting above thumbnail container
counterAboveThumbnailContainer: {
  position: "absolute",
  bottom: 100, // adjust so it sits above the thumbnail strip
  alignSelf: "center",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 10,
  zIndex: 25, // above thumbnails
},
counterAboveThumbnails: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "600",
},



  carouselWrapper: {
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    width,
    height: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  counterOverlay: {
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  counterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  navButton: {
    position: "absolute",
    top: "40%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  navButtonOut:{
    position: "absolute",
    top: "50%",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  navLeft: { left: 12 },
  navRight: { right: 12 },
  navButtonText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  outsideActionsContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "column",
    gap: 12,
    zIndex: 10,
  },
  actionLikeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "royalblue",
    justifyContent: "center",
    alignItems: "center",
  },
fullScreenContainer: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.9)",
  justifyContent: "flex-start",
  overflow: "visible",
},

  topControls: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 15,
  },
  topIcon: { color: "#fff", fontSize: 24 },
  topClose: { color: "#fff", fontSize: 20 },
fullScreenImageWrapper: {
  width,
  height: height * 0.7,
  justifyContent: "center",
  alignItems: "center",
},
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
thumbnailStripContainer: {
  position: "absolute",
  bottom: 0,
  width: "100%",
  backgroundColor: "rgba(0,0,0,0.8)",
  paddingVertical: 8,
  zIndex: 20,
},
  thumbnailStrip: {
    alignItems: "center",
    paddingHorizontal: 10,
  },
  thumbBox: {
    width: 60,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbActive: {
    borderColor: "#fff",
  },
  thumbImage: {
    width: 60,
    height: 60,
  },
  noImageText: {
    textAlign: "center",
    paddingVertical: 40,
    color: "#666",
  },
});
