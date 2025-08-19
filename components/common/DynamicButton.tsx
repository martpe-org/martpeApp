import { useRef, FC, ReactNode, useMemo } from "react";
import { Animated, TouchableOpacity } from "react-native";
import { useToast } from "react-native-toast-notifications";
import useUserDetails from "../../hook/useUserDetails";
import { useCartStore } from "../../state/useCartStore";

interface DynamicButtonProps {
  children: ReactNode;
  isNewItem?: boolean;
  storeId?: string;
  slug?: string;
  catalogId?: string;
  customizable?: boolean;
  customizations?: {
    groupId?: string;
    optionId?: string;
    name: string;
  }[];
  onSuccess?: () => void;
  disabled?: boolean;
}
const DynamicButton: FC<DynamicButtonProps> = ({
  children,
  isNewItem,
  storeId,
  slug,
  catalogId,
  customizable = false,
  customizations = [],
  onSuccess,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const toast = useToast();
  const { authToken, isAuthenticated } = useUserDetails();
  const { addItem } = useCartStore();

  const normalizedCustomizations = useMemo(
    () =>
      customizations.map((c) => ({
        groupId: c.groupId || "",
        optionId: c.optionId || "",
        name: c.name,
      })),
    [customizations]
  );

  const animatePress = () => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.9,
        speed: 15,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 2,
        tension: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = async () => {
    if (disabled) return;
    animatePress();

    if (!isAuthenticated || !authToken) {
      toast.show("Please login to continue", { type: "danger" });
      return;
    }

    if (isNewItem && storeId && slug && catalogId) {
      const success = await addItem(
        storeId,
        slug,
        catalogId,
        1,
        customizable,
        normalizedCustomizations,
        authToken
      );
      if (success) onSuccess?.();
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={disabled ? { opacity: 0.5 } : undefined}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DynamicButton;
