import React from "react";
import Checkout from "../../../components/Checkout/Checkout";
import { useLocalSearchParams } from "expo-router";
import { AlertNotificationRoot } from "react-native-alert-notification";

const CheckOut = () => {
  const { id } = useLocalSearchParams();
  return (
    <AlertNotificationRoot>
      <Checkout id={id} />
    </AlertNotificationRoot>

  );
};

export default CheckOut;


