import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAsyncStorageItem = async (itemName: string): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(itemName);
    return value;
  } catch (error) {
    console.error(`Unable to fetch async storage item [${itemName}]:`, error);
    return null;
  }
};

export const setAsyncStorageItem = async (itemName: string, itemValue: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(itemName, itemValue);
  } catch (error) {
    console.error(`Unable to set async storage item [${itemName}]:`, error);
  }
};

export const removeAsyncStorageItem = async (itemName: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(itemName);
  } catch (error) {
    console.error(`Unable to remove async storage item [${itemName}]:`, error);
  }
};
