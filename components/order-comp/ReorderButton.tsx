import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reOrder } from '../order/Reorder';
import { useCart } from '@/hook/CartProvider';


interface Props {
  orderId: string;
  storeId: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: any;
}

export function ReorderButton({ 
  orderId, 
  storeId, 
  variant = 'outline',
  size = 'sm',
  style 
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
const cart = useCart(); 
const reorderCartState = cart((state) => state.reorder);
  const router = useRouter();

  const handleReorder = async () => {
    setIsLoading(true);

    try {
      // Get auth token from AsyncStorage
      const authToken = await AsyncStorage.getItem('auth-token');
      
      if (!authToken) {
        Alert.alert('Error', 'Authentication required. Please login again.');
        router.push('/home/HomeScreen');
        return;
      }

      const data = await reOrder(orderId, storeId, authToken);

      if (data && data.length > 0) {
        reorderCartState(data);
        Alert.alert(
          'Success',
          'Items added to cart successfully!',
          [
            {
              text: 'Continue Shopping',
              style: 'cancel',
            },
            {
              text: 'View Cart',
              onPress: () => router.push('/cart'),
            },
          ]
        );
      } else {
        Alert.alert('Error', 'No items found to reorder or something went wrong!');
      }
    } catch (error) {
      console.error('Reorder error:', error);
      Alert.alert('Error', 'Failed to reorder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    switch (variant) {
      case 'default':
        baseStyle.push(styles.defaultButton);
        break;
      case 'outline':
        baseStyle.push(styles.outlineButton);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostButton);
        break;
    }

    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallButton);
        break;
      case 'md':
        baseStyle.push(styles.mediumButton);
        break;
      case 'lg':
        baseStyle.push(styles.largeButton);
        break;
    }

    if (isLoading) {
      baseStyle.push(styles.disabledButton);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.buttonText];

    switch (variant) {
      case 'default':
        baseStyle.push(styles.defaultText);
        break;
      case 'outline':
        baseStyle.push(styles.outlineText);
        break;
      case 'ghost':
        baseStyle.push(styles.ghostText);
        break;
    }

    switch (size) {
      case 'sm':
        baseStyle.push(styles.smallText);
        break;
      case 'md':
        baseStyle.push(styles.mediumText);
        break;
      case 'lg':
        baseStyle.push(styles.largeText);
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={handleReorder}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={getTextStyle()}>Reorder</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Variant styles
  defaultButton: {
    backgroundColor: '#ef4444',
  },
  outlineButton: {
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  ghostButton: {
    backgroundColor: 'transparent',
  },
  
  // Size styles
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 70,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 80,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 100,
  },
  
  // Text styles
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  defaultText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#ffffff',
  },
  ghostText: {
    color: '#ef4444',
  },
  
  // Size text styles
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // State styles
  disabledButton: {
    opacity: 0.6,
  },
});