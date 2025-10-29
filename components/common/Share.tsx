import React from "react";
import { TouchableOpacity, Share, Alert } from "react-native";
import useUserDetails from "../../hook/useUserDetails";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ShareProps {
  productId?: string;
  productName?: string;
  storeId?: string;
  storeName?: string;
  type: string;
  size?: number;
  address?: string;
}

const ShareButton: React.FC<ShareProps> = ({
  productId,
  productName,
  storeId,
  storeName,
  type,
  size,
  address,
}) => {
  const { userDetails } = useUserDetails();

const getMessage = (
  type: string,
  username: string,
  productName?: string,
  storeName?: string,
  productId?: string,
  storeId?: string,
  address?: string
) => {
  switch (type) {
    case "item":
      return `Hey! ${username} has shared *${productName}* from *${storeName}* outlet on the app! Click on the link to view the product: https://www.martpe.in/product/${productId}`;
    case "outlet":
      return `Hey! ${username} has shared *${storeName}* outlet on the app! Click on the link to view the outlet: https://www.martpe.in/store/${storeId}`;
    default:
      return `Hey! ${username} has shared an address: ${address} on the app! Click here to open: https://www.martpe.in/address`;
  }
};


  const shareMessage = async () => {
    if (!userDetails) {
      Alert.alert("Please log in to share");
      return;
    }
    try {
      await Share.share({
        message: getMessage(
          type,
          userDetails.firstName,
          productName,
          storeName,
          productId,
          storeId,
          address
        ),
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <TouchableOpacity onPress={shareMessage}>
      <MaterialCommunityIcons
        name="share-variant-outline"
        size={size || 24}
        color="#0e284e"
      />
    </TouchableOpacity>
  );
};

export default ShareButton;
