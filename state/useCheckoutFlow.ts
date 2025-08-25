import { RetailsErrorCode } from "@/components/Checkout/retailsErrorCode";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import {
  confirmOrder,
  createPaymentOrder,
  showOrderErrorDialog,
  showOrderSuccessDialog,
  showPaymentErrorDialog,
  showPaymentSuccessDialog,
} from "../components/Checkout/paymentUtils";
import {
  breakupT,
  selectCallUserMessageT,
  selectResponseMessageT,
  userDetailsT,
} from "../components/Checkout/types";
import { getUserDetails } from "../hook/useUserDetails";
import useDeliveryStore from "./deliveryAddressStore";

const select_ws_url = "wss://api-sandbox.martpe.in/api/v1/user/select";
const init_ws_url = "wss://api-sandbox.martpe.in/api/v1/user/init";

export const useCheckoutFlow = (cartId: string, items: any[]) => {
  const selectedDetails = useDeliveryStore((state) => state.selectedDetails);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [onSelectData, setOnSelectData] = useState<
    selectResponseMessageT["data"] | null
  >(null);
  const [userDetails, setUserDetails] = useState<userDetailsT | null>(null);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [breakup, setBreakup] = useState<breakupT | null>(null);
  const [updatedItems, setUpdatedItems] = useState([]);
  const [savings, setSavings] = useState(0);
  const [enablePayment, setEnablePayment] = useState(true);

  // WebSocket handlers
  const handleSelect = useCallback(
    async (userId: string) => {
      if (!selectedDetails?.city || !selectedDetails?.state) return;

      try {
        const selectCallBody: selectCallUserMessageT = {
          context: {
            city: selectedDetails.city,
            state: selectedDetails.state,
          },
          message: {
            userId: userId,
            cartId: cartId,
            fulfillmentAddressId: selectedDetails.addressId,
          },
        };

        const ws = new WebSocket(select_ws_url);

        ws.onopen = () => {
          ws.send(JSON.stringify(selectCallBody));
        };

        ws.onmessage = (event) => {
          const response: selectResponseMessageT = JSON.parse(event.data);

          if (response.data?.context.action === "on_select") {
            setOnSelectData(response.data);
            setGrandTotal(
              response.data.message?.order?.quote?.price?.value || 0
            );
            setIsLoading(false);

            if (response.data.error) {
              Dialog.show({
                closeOnOverlayTap: false,
                type: ALERT_TYPE.DANGER,
                title: "Unable to complete your purchase",
                button: "Cancel",
                textBody: `${
                  RetailsErrorCode[response.data.error.code] ||
                  response.data.error.message
                }`,
                onPressButton: () => router.back(),
              });
            }
            ws.close();
          }

          if (response.error) {
            Dialog.show({
              closeOnOverlayTap: false,
              type: ALERT_TYPE.DANGER,
              title: "Unable to complete your purchase",
              button: "Cancel",
              textBody: `${response.error}`,
              onPressButton: () => router.back(),
            });
            ws.close();
          }
        };

        ws.onclose = () => setIsLoading(false);
        ws.onerror = () => {
          Dialog.show({
            closeOnOverlayTap: false,
            type: ALERT_TYPE.DANGER,
            title: "We're sorry",
            textBody: "Your order could not be processed.",
            button: "Cancel",
            onPressButton: () => router.back(),
          });
          ws.close();
        };
      } catch (error) {
        console.error("Select error:", error);
        setIsLoading(false);
      }
    },
    [selectedDetails, cartId]
  );

  const handleInit = useCallback(async () => {
    if (!onSelectData?.id || !userDetails?.userId) return;

    try {
      setIsLoading(true);
      const initCallBody = {
        context: { onselectId: onSelectData.id },
        message: {
          userId: userDetails.userId,
          deliveryAddressId: selectedDetails?.addressId,
        },
      };

      const ws = new WebSocket(init_ws_url);

      ws.onopen = () => ws.send(JSON.stringify(initCallBody));

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);

        if (response.error) {
          setIsLoading(false);
          Dialog.show({
            closeOnOverlayTap: false,
            type: ALERT_TYPE.DANGER,
            title: "We're sorry",
            textBody: "Your order could not be processed.",
            button: "Cancel",
            onPressButton: () => router.back(),
          });
          ws.close();
        } else if (response?.data?.context?.action === "on_init") {
          setIsLoading(false);
          ws.close();
          if (response.data.id) {
            createOrder(response.data.id);
          } else {
            Dialog.show({
              closeOnOverlayTap: false,
              type: ALERT_TYPE.DANGER,
              title: "We're sorry",
              textBody: "Your order could not be processed.",
              button: "Cancel",
              onPressButton: () => router.back(),
            });
          }
        }
      };

      ws.onclose = () => setIsLoading(false);
      ws.onerror = () => {
        setIsLoading(false);
        Dialog.show({
          closeOnOverlayTap: false,
          type: ALERT_TYPE.DANGER,
          title: "We're sorry",
          textBody: "Your order could not be processed.",
          button: "Cancel",
          onPressButton: () => router.back(),
        });
        ws.close();
      };
    } catch (error) {
      console.error("Init error:", error);
      setIsLoading(false);
    }
  }, [onSelectData, userDetails, selectedDetails]);
  const handleConfirm = useCallback(
    async (initId: string) => {
      if (!userDetails?.userId) return;

      try {
        setIsConfirming(true);

        const ws = confirmOrder(
          initId,
          userDetails.userId,
          (orderId) => {
            setIsConfirming(false);
            showOrderSuccessDialog(orderId);
          },
          (error) => {
            setIsConfirming(false);
            showOrderErrorDialog(error);
          }
        );

        // Cleanup function to close WebSocket if component unmounts
        return () => {
          if (
            ws.readyState === WebSocket.OPEN ||
            ws.readyState === WebSocket.CONNECTING
          ) {
            ws.close();
          }
        };
      } catch (error) {
        console.error("Confirm error:", error);
        setIsConfirming(false);
        showOrderErrorDialog("Could not confirm order");
      }
    },
    [userDetails]
  );

  const createOrder = useCallback(
    async (initId: string) => {
      if (!userDetails?.accessToken || !selectedDetails?.addressId) return;

      try {
        const paymentOptions = {
          cartId,
          initId,
          deliveryAddressId: selectedDetails.addressId,
          grandTotal,
          userDetails,
        };

        const result = await createPaymentOrder(paymentOptions);

        if (result.success) {
          showPaymentSuccessDialog("Payment initiated successfully");
          handleConfirm(initId);
        } else {
          showPaymentErrorDialog(result.error || "Payment failed");
        }
      } catch (error) {
        console.error("Payment creation error:", error);
        showPaymentErrorDialog("Could not process payment");
      }
    },
    [userDetails, cartId, selectedDetails, grandTotal, handleConfirm]
  );

  // Compare and update items
  const compareAndUpdateItems = useCallback(
    (oldItems: any[], newItems: any[]) => {
      let newSavings = 0;
      setEnablePayment(true);

      const updatedItems = oldItems.map((oldItem) => {
        const newItem = newItems.find(
          (item) => item.id === oldItem.details.catalog_id
        );

        if (newItem) {
          newSavings +=
            (oldItem.details.price.maximum_value - newItem.price) *
            newItem.quantity;

          const updatedItem = {
            ...oldItem,
            quantity: newItem.quantity,
            details: {
              ...oldItem.details,
              price: { ...oldItem.details.price, value: newItem.price },
            },
            maxQuantity: newItem.maxQuantity,
            log: [],
            available: true,
          };

          // Compare and update price
          if (oldItem.details.price.value !== parseInt(newItem.price)) {
            updatedItem.log.push(
              `* Price updated from ₹${Number(oldItem.details.price.value)
                .toFixed(2)
                .replace(/\.?0+$/, "")} to ₹${Number(newItem.price)
                .toFixed(2)
                .replace(/\.?0+$/, "")}`
            );
          }

          // Compare and update quantity
          if (oldItem.quantity !== newItem.quantity) {
            updatedItem.log.push(
              `* Quantity updated from ${oldItem.quantity} to ${newItem.quantity}`
            );
          }

          return updatedItem;
        } else {
          newSavings +=
            (oldItem.details.price.maximum_value -
              oldItem.details.price.value) *
            oldItem.quantity;
          setEnablePayment(false);

          return {
            ...oldItem,
            available: false,
            maxQuantity: Math.min(
              oldItem.details.quantity.maximum.count,
              oldItem.details.quantity.available.count
            ),
            log: ["Unavailable"],
          };
        }
      });

      setSavings(newSavings);
      setUpdatedItems(updatedItems);
    },
    []
  );

  // Initialize checkout flow
  useEffect(() => {
    const initCheckout = async () => {
      if (!selectedDetails?.addressId) {
        Dialog.show({
          closeOnOverlayTap: false,
          type: ALERT_TYPE.WARNING,
          title: "No Address Selected",
          button: "ok",
          textBody: "Please select a delivery address",
          onPressButton: () => router.push("/address/SavedAddresses"),
        });
        return;
      }

      try {
        const userDetailsData = await getUserDetails();
        const parsedUserDetails = JSON.parse(userDetailsData);
        setUserDetails(parsedUserDetails);
        await handleSelect(parsedUserDetails.userId);
      } catch (error) {
        console.error("Init checkout error:", error);
        setIsLoading(false);
      }
    };

    initCheckout();
  }, [selectedDetails, handleSelect]);

  // Process onSelect data
  useEffect(() => {
    if (!onSelectData) return;

    let newItems: any[] = [];
    let delivery = 0;
    let packing = 0;
    let convenience = 0;
    let discount = 0;
    let tax = 0;
    let newItemTotal = 0;

    onSelectData.message?.order?.quote?.breakup?.forEach((item: any) => {
      switch (item.type) {
        case "delivery":
          delivery = Number(item.price?.value || 0);
          break;
        case "packing":
          packing = Number(item.price?.value || 0);
          break;
        case "misc":
          convenience = Number(item.price?.value || 0);
          break;
        case "discount":
          discount = Number(item.price?.value || 0);
          break;
        case "tax":
          tax = Number(item.price?.value || 0);
          break;
        case "item":
          const updatedItem = {
            id: item.id,
            price:
              Number(item.details.price.value) / Number(item.quantity.count),
            quantity: item.quantity.count,
            maxQuantity: Math.min(
              item.details.quantity.maximum.count,
              item.details.quantity.available.count
            ),
          };
          newItems.push(updatedItem);
          newItemTotal += updatedItem.price * updatedItem.quantity;
          break;
      }
    });

    const newBreakup = { delivery, packing, convenience, discount, tax };
    compareAndUpdateItems(items, newItems);
    setItemsTotal(newItemTotal);
    setBreakup(newBreakup);
  }, [onSelectData, items, compareAndUpdateItems]);

  return {
    // State
    isLoading,
    isConfirming,
    onSelectData,
    userDetails,
    itemsTotal,
    grandTotal,
    breakup,
    updatedItems,
    savings,
    enablePayment,

    // Actions
    handleInit,
  };
};
