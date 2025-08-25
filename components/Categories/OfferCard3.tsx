import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import ImageComp from "../common/ImageComp";

type OfferDataType = {
  id?: string;
  calculated_max_offer?: {
    percent?: number;
  };
  descriptor?: {
    name?: string;
    images?: string[];
    symbol?: string;
  };
};

interface OfferCard3Props {
  offerData: OfferDataType;
}

function OfferCard3({ offerData }: OfferCard3Props) {
  if (!offerData) return null;

  const { calculated_max_offer, descriptor, id } = offerData;

  const percent = calculated_max_offer?.percent ?? 0;
  const name = descriptor?.name ?? "";
  const images = descriptor?.images ?? [];
  const symbol = descriptor?.symbol ?? "";

  const containerHeight = 200;
  const screenWidth = Dimensions.get("window").width;

  return (
    <View
      style={[
        styles.container,
        { height: containerHeight, width: screenWidth },
      ]}
    >
      {/* Background Image */}
      {images.length > 0 && (
        <ImageComp
          source={images[0]}
          imageStyle={styles.imgBg}
          resizeMode="cover"
          fallbackSource={{
            uri: "https://via.placeholder.com/400x200?text=Offer",
          }}
          loaderColor="white"
        />
      )}

      <View style={styles.overlay}>
        <View style={styles.offerDescription}>
          <Text style={styles.discount}>Up to {Math.round(percent)}% Off</Text>
          <Text style={styles.discountDesc}>on products from {name}</Text>
        </View>

        <TouchableOpacity
          onPressIn={() => {
            if (id) {
              router.push(`/(tabs)/home/result/productListing/${id}`);
            }
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Order Now</Text>
        </TouchableOpacity>

        {/* Logo/Symbol */}
        {symbol && (
          <View style={styles.logoContainer}>
            <ImageComp
              source={symbol}
              imageStyle={styles.logoImage}
              resizeMode="contain"
              fallbackSource={{
                uri: "https://via.placeholder.com/120x40?text=Logo",
              }}
              loaderColor="white"
              loaderSize="small"
            />
          </View>
        )}
      </View>
    </View>
  );
}

export default OfferCard3;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    position: "relative",
  },
  imgBg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  offerDescription: {
    position: "absolute",
    bottom: 15,
    left: 15,
  },
  discount: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  discountDesc: {
    color: "white",
    fontSize: 12,
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 5,
    width: 72,
    borderRadius: 50,
    borderColor: "#000000",
    marginTop: 20,
    position: "relative",
    bottom: 15,
    left: 15,
  },
  buttonText: {
    color: "#000000",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  logoContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 120,
    height: 40,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
});
