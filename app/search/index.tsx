import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { Colors, Fonts } from "../../theme";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "react-native-paper";
import ImageComp from "../../components/common/ImageComp";
import Svg, { Path } from "react-native-svg";
import {
  getAsyncStorageItem,
  setAsyncStorageItem,
} from "../../utility/asyncStorage";
import { fetchSearchSuggesstions } from "./fetch-suggest";
import {  SuggestionsType } from "./fetch-suggest-type";
import useDeliveryStore from "../../state/deliveryAddressStore";

const { width, height } = Dimensions.get("window");

const searchTexts = ["grocery", "biryani", "clothing", "electronics"];

interface SelectedDetails {
  lat: number;
  lng: number;
}

const SearchScreen: React.FC = () => {
  const params = useLocalSearchParams();
  const domain = params.domain as string | undefined;
  const placeHolder = params.placeHolder as string | undefined;
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedInput, setDebouncedInput] = useState<string>("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionsType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTextIndex, setSearchTextIndex] = useState<number>(0);
  const selectedDetails = useDeliveryStore(
    (state) => state.selectedDetails
  ) as SelectedDetails;

  // Abort controller for API requests
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // used to change the search placeholder text values from within an array
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTextIndex((prevIndex) => (prevIndex + 1) % searchTexts.length);
    }, 3000); // Change index every 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch recent searches when the component mounts
    const loadRecentSearches = async (): Promise<void> => {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
      console.log("searches", searches);
    };

    loadRecentSearches();
  }, []);

  const GotoArrow: React.FC = () => {
    return (
      <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
        <Path
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 17 17 7M7 7h10v10"
        />
      </Svg>
    );
  };

  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }

    const timerId = setTimeout(() => {
      setDebouncedInput(inputValue);
    }, 500); // Delay for 500ms

    return () => clearTimeout(timerId);
  }, [inputValue]);

  useEffect(() => {
    if (debouncedInput.length < 3) {
      setIsLoading(false);
      setSuggestions([]);
      return;
    }

    async function fetchSuggestions(): Promise<void> {
      try {
        // Cancel previous request if it exists
        if (abortController) {
          abortController.abort();
        }

        const newAbortController = new AbortController();
        setAbortController(newAbortController);
        setIsLoading(true);

        // Get pincode from selected details or use default
        const pincode = "110001"; // You might want to get this from your delivery store or user location

        const response = await fetchSearchSuggesstions(
          newAbortController.signal,
          selectedDetails?.lat || 28.6139, // Default to Delhi coordinates if not available
          selectedDetails?.lng || 77.209,
          pincode,
          debouncedInput,
          domain
        );

        if (response) {
          setSuggestions(response);
          console.log("Search suggestions:", response);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSuggestions();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [debouncedInput, selectedDetails, domain]);

  const getRecentSearches = async (): Promise<string[]> => {
    try {
      const searches = await getAsyncStorageItem("recentSearches");
      return searches ? JSON.parse(searches) : [];
    } catch (error) {
      console.error("Error retrieving recent searches:", error);
      return [];
    }
  };

  const saveSearchTerm = async (searchTerm: string): Promise<void> => {
    try {
      const currentSearches = await getAsyncStorageItem("recentSearches");
      let searches: string[] = currentSearches
        ? JSON.parse(currentSearches)
        : [];

      // Remove the search term if it already exists to avoid duplicates
      searches = searches.filter((search) => search !== searchTerm);
      // Add the new search term at the beginning
      searches.unshift(searchTerm);
      // Keep only the latest 10 searches
      searches = searches.slice(0, 10);

      await setAsyncStorageItem("recentSearches", JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.error("Error saving search term:", err);
    }
  };

  const removeSearchTerm = async (searchTerm: string): Promise<void> => {
    try {
      const currentSearches = await getAsyncStorageItem("recentSearches");
      let searches: string[] = currentSearches
        ? JSON.parse(currentSearches)
        : [];
      searches = searches.filter((search) => search !== searchTerm);
      await setAsyncStorageItem("recentSearches", JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.error("Error removing search term:", err);
    }
  };

const handleSearchSubmit = async (): Promise<void> => {
  if (inputValue.length < 3) return;
  await saveSearchTerm(inputValue);
  router.push({
    pathname: "/(tabs)/home/result/[search]",
    params: {
      search: inputValue,
      domainData: domain,
    },
  });
};

const handleSuggestionPress = async (
  suggestion: SuggestionsType
): Promise<void> => {
  await saveSearchTerm(suggestion.name);

  if (suggestion.type === "store" || suggestion.type === "vendor") {
    // Navigate to store/vendor page
    router.push(`/(tabs)/home/result/productListing/${suggestion.slug}`);
  } else {
    // Navigate to search results
    router.push({
      pathname: "/(tabs)/home/result/[search]",
      params: {
        search: suggestion.name,
        domainData: domain || suggestion.domain,
      },
    });
  }
};


  const getItemTypeLabel = (type: string, domain: string): string => {
    if (type === "store" || type === "vendor") {
      return domain === "ONDC:RET11" ? "Restaurant" : "Store";
    }
    return domain === "ONDC:RET11" ? "Item" : "Product";
  };

  // Helper function to get proper image source
  const getImageSource = (symbolUrl: string | undefined) => {
    if (symbolUrl && typeof symbolUrl === 'string' && symbolUrl.length > 0) {
      return { uri: symbolUrl };
    }
    // Default fallback image
    return { 
      uri: "https://res.cloudinary.com/doex3braa/image/upload/v1703058217/martpe/food/sihuigqn0bv4ustt4wyi.png" 
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Feather
            name="arrow-left"
            style={styles.headerLeftIcon}
            onPress={() => router.back()}
          />
          <Text
            style={{
              ...Fonts.medium(16),
              color: Colors.BLACK_COLOR,
              textAlign: "center",
            }}
          >
            Search anything you want
          </Text>
        </View>

        {/* search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            value={inputValue}
            onChangeText={(newText: string) => setInputValue(newText)}
            autoFocus={true}
            placeholder={
              placeHolder
                ? placeHolder
                : `Search for '${searchTexts[searchTextIndex]}'`
            }
            style={{
              height: 50,
              borderColor: "white",
              borderWidth: 2,
              borderRadius: 10,
              width: width * 0.6,
              paddingHorizontal: 20,
              paddingLeft: 10,
              color: "#8E8A8A",
              textAlign: "left",
              flex: 1,
            }}
            selectionColor="#8E8A8A"
            placeholderTextColor="#8E8A8A"
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />

          <TouchableOpacity onPress={handleSearchSubmit} style={styles.icon}>
            <Feather name="search" size={20} color="#8E8A8A" />
          </TouchableOpacity>
        </View>
      </View>

      {inputValue.length < 3 ? (
        <View style={styles.recentSearchContainer}>
          <Text style={styles.recentSearchHeader}>
            {recentSearches.length > 0
              ? "Recent Searches"
              : "Discover something new!"}
          </Text>
          <View style={styles.recentSearchItemsContainer}>
            {recentSearches.slice(0, 5).map((search: string, index: number) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => {
                  setInputValue(search);
                  router.push({
                    pathname: "../result/[search]",
                    params: {
                      search: search,
                      domainData: domain,
                    },
                  });
                }}
              >
                <Feather name="clock" size={13} color="#35374B" />
                <Text style={styles.recentSearchText}>
                  {search.length < 20 ? search : search.slice(0, 20) + "..."}
                </Text>
                <TouchableOpacity
                  onPress={() => removeSearchTerm(search)}
                  style={styles.removeRecentSearch}
                >
                  <MaterialCommunityIcons
                    name="close"
                    size={14}
                    color="#35374B"
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View>
          <Text style={{ marginHorizontal: 20, marginBottom: 10 }}>
            Suggestions
          </Text>
          {isLoading ? (
            <View style={{ alignItems: "center", marginTop: 20 }}>
              <ActivityIndicator size="large" color="red" />
            </View>
          ) : suggestions.length > 0 ? (
            <SafeAreaView style={{ flex: 1, minHeight: height * 0.8 }}>
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
              >
                {suggestions.map(
                  (suggestion: SuggestionsType, index: number) => (
                    <TouchableOpacity
                      onPress={() => handleSuggestionPress(suggestion)}
                      style={styles.searchRow}
                      key={`${suggestion.slug}-${index}`}
                    >
                      <ImageComp
                        source={getImageSource(suggestion.symbol)}
                        imageStyle={{
                          height: 40,
                          width: 40,
                          borderRadius: 20,
                        }}
                        resizeMode="cover"
                      />
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "80%",
                        }}
                      >
                        <View>
                          <Text style={styles.productName}>
                            {suggestion.name}
                          </Text>
                          <Text
                            style={{
                              color: "gray",
                              marginLeft: 15,
                              fontSize: 12,
                            }}
                          >
                            {getItemTypeLabel(
                              suggestion.type,
                              suggestion.domain
                            )}
                          </Text>
                        </View>
                        <GotoArrow />
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </ScrollView>
            </SafeAreaView>
          ) : (
            <View
              style={{
                alignItems: "flex-start",
                marginTop: 20,
                marginHorizontal: 20,
              }}
            >
              <Text>No results found</Text>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE_COLOR,
    paddingVertical: width * 0.1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: "column",
    paddingVertical: 10,
    backgroundColor: Colors.WHITE_COLOR,
  },
  containerStyle: {
    backgroundColor: Colors.WHITE_COLOR,
    borderWidth: 0,
    borderRadius: 10,
  },
  headerIcon: {
    color: Colors.WHITE_COLOR,
    marginLeft: 15,
    fontSize: 25,
  },
  headerLeftIcon: {
    color: Colors.BLACK_COLOR,
    marginRight: 15,
    fontSize: 25,
    position: "absolute",
    left: 0,
  },
  removeRecentSearch: {},
  searchRow: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.CARD_BORDER_COLOR,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  productName: {
    ...Fonts.boldMontserrat(14),
    color: Colors.BLACK_COLOR,
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: "row",
    borderColor: "#C7C4C4",
    borderWidth: 1.5,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
  },
  icon: {
    paddingRight: 20,
  },
  recentSearchContainer: {
    marginTop: 10,
    paddingHorizontal: 15,
  },
  recentSearchItemsContainer: {
    marginTop: 10,
    rowGap: 10,
    columnGap: 5,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
  },
  recentSearchHeader: {
    marginVertical: 5,
    fontSize: 16,
  },
  recentSearchItem: {
    paddingVertical: Dimensions.get("window").width * 0.01,
    paddingHorizontal: 10,
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
  },
  recentSearchText: {
    fontSize: 13,
    color: "#35374B",
    marginHorizontal: Dimensions.get("window").width * 0.01,
  },
});