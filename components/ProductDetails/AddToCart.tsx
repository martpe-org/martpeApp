import React, { FC, useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import DynamicButton from "../common/DynamicButton";
import useUserDetails from "../../hook/useUserDetails";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import { useCartStore } from "../../state/useCartStore";
import { useToast } from "react-native-toast-notifications";

const { width } = Dimensions.get("window");

interface AddToCartProps {
  price: number;
  storeId: string;
  slug?: string;
   storeSlug?: string;
  catalogId?: string;
  customizable?: boolean;
  customizations?: {
    _id?: string;
    id?: string;
    groupId?: string;
    group_id?: string;
    optionId?: string;
    option_id?: string;
    name: string;
  }[];
  onCartChange?: () => void;

  buttonStyle?: any;
  textStyle?: any;
}

const STORAGE_KEY = "addedItems";

const AddToCart: FC<AddToCartProps> = ({
  price,
  storeId,
  slug,
  catalogId,
  customizable,
  customizations = [],
  onCartChange,
  buttonStyle,
  textStyle,
}) => {
  const { isAuthenticated, authToken } = useUserDetails();
  const { removeCart } = useCartStore();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const normalizedCustomizations = customizations.map((custom) => ({
    _id: custom._id || custom.id,
    groupId: custom.groupId || custom.group_id || "",
    optionId: custom.optionId || custom.option_id || "",
    name: custom.name,
  }));

  useEffect(() => {
    const checkAdded = async () => {
      try {
        const data = await getAsyncStorageItem(STORAGE_KEY);
        const addedItems: string[] = data ? JSON.parse(data) : [];
        if (slug && addedItems.includes(slug)) {
          setAdded(true);
          animatedValue.setValue(1);
        }
      } catch (error) {
        console.error("Error loading added state:", error);
      }
    };
    checkAdded();
  }, [slug]);

  const handleToggle = async () => {
    if (!isAuthenticated || !authToken || !slug) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    try {
      const data = await getAsyncStorageItem(STORAGE_KEY);
      let addedItems: string[] = data ? JSON.parse(data) : [];

      if (!added) {
        // ✅ ADD (no toast here, DynamicButton already shows "Added to cart")
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }).start();

        addedItems.push(slug);
        setAdded(true);
      } else {
        // ✅ REMOVE (only toast here)
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }).start();

        addedItems = addedItems.filter((s) => s !== slug);
        setAdded(false);

        try {
          const success = await removeCart(storeId, authToken);
          if (!success) {
            toast.show("Failed to remove item from cart", { type: "danger" });
          } else {
            toast.show("Item removed", { type: "danger" });
          }
        } catch (err) {
          console.error("Error removing cart item:", err);
          toast.show("Failed to remove item", { type: "danger" });
        }
      }

      await setAsyncStorageItem(STORAGE_KEY, JSON.stringify(addedItems));
      onCartChange?.();
    } catch (error) {
      console.error("Error toggling item:", error);
      toast.show("Error updating cart", { type: "danger" });
    }
  };

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#ee1936", "#272b28"],
  });

  const textColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["#fff", "#fff"],
  });

  return (
    <DynamicButton
      isNewItem
      storeId={storeId}
      slug={slug}
      catalogId={catalogId}
      customizable={customizable}
      customizations={normalizedCustomizations}
      onSuccess={handleToggle} // ✅ only our toggle handles remove
    >
      <Animated.View
        style={[
          styles.addButton,
          { backgroundColor },
          buttonStyle,
        ]}
      >
        <Animated.Text
          style={[
            styles.buttonText,
            { color: textColor },
            textStyle,
          ]}
        >
          {added ? "Added to cart" : "Add to Cart"}
        </Animated.Text>
      </Animated.View>
    </DynamicButton>
  );
};

export default AddToCart;

const styles = StyleSheet.create({
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.025,
    borderRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
