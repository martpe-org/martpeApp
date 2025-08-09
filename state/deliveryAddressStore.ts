import { create } from 'zustand';
import { setAsyncStorageItem, getAsyncStorageItem, removeAsyncStorageItem } from '../utility/asyncStorage';

export interface DeliveryDetails {
  addressId: string;
  city: string;
  state: string;
  pincode: string;
  fullAddress: string;
  name: string;
  isDefault: boolean;
  lat: number;
  lng: number;
}

interface DeliveryStore {
  selectedDetails: DeliveryDetails | null;
  addDeliveryDetail: (details: DeliveryDetails) => Promise<void>;
  removeDeliveryDetail: () => Promise<void>;
  loadDeliveryDetails: () => Promise<void>;
  clearDeliveryDetails: () => Promise<void>;
}

const DELIVERY_STORAGE_KEY = 'selectedDeliveryAddress';

const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  selectedDetails: null,

  // Add/Update delivery details and save to AsyncStorage
  addDeliveryDetail: async (details: DeliveryDetails) => {
    try {
      // Save to AsyncStorage
      await setAsyncStorageItem(DELIVERY_STORAGE_KEY, JSON.stringify(details));
      
      // Update Zustand store
      set({ selectedDetails: details });
      
      console.log('Delivery details saved to AsyncStorage:', details);
    } catch (error) {
      console.error('Error saving delivery details to AsyncStorage:', error);
    }
  },

  // Remove delivery details from both store and AsyncStorage
  removeDeliveryDetail: async () => {
    try {
      await removeAsyncStorageItem(DELIVERY_STORAGE_KEY);
      set({ selectedDetails: null });
      console.log('Delivery details removed from AsyncStorage');
    } catch (error) {
      console.error('Error removing delivery details from AsyncStorage:', error);
    }
  },

  // Load delivery details from AsyncStorage
  loadDeliveryDetails: async () => {
    try {
      const storedDetails = await getAsyncStorageItem(DELIVERY_STORAGE_KEY);
      
      if (storedDetails && typeof storedDetails === 'string') {
        const parsedDetails = JSON.parse(storedDetails) as DeliveryDetails;
        set({ selectedDetails: parsedDetails });
        console.log('Delivery details loaded from AsyncStorage:', parsedDetails);
      } else {
        console.log('No delivery details found in AsyncStorage');
        set({ selectedDetails: null });
      }
    } catch (error) {
      console.error('Error loading delivery details from AsyncStorage:', error);
      set({ selectedDetails: null });
    }
  },

  // Clear delivery details (same as remove but different semantic meaning)
  clearDeliveryDetails: async () => {
    const { removeDeliveryDetail } = get();
    await removeDeliveryDetail();
  },
}));

export default useDeliveryStore;