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
import { SuggestionsType } from "./fetch-suggest-type";
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
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setSearchTextIndex((prevIndex) => (prevIndex + 1) % searchTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Load recent searches
  useEffect(() => {
    const loadRecentSearches = async () => {
      const searches = await getRecentSearches();
      setRecentSearches(searches);
    };
    loadRecentSearches();
  }, []);

  // Arrow icon
  const GotoArrow: React.FC = () => (
    <Svg width={24} height={24} fill="none" viewBox="0 0 24 24">
      <Path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7 17 17 7M7 7h10v10"
      />
    </Svg>
  );

  // Debounce input
  useEffect(() => {
    if (inputValue.length < 3) {
      setSuggestions([]);
      return;
    }
    const timerId = setTimeout(() => {
      setDebouncedInput(inputValue);
    }, 500);
    return () => clearTimeout(timerId);
  }, [inputValue]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedInput.length < 3) {
      setIsLoading(false);
      setSuggestions([]);
      return;
    }
    async function fetchSuggestions() {
      try {
        if (abortController) abortController.abort();

        const newAbortController = new AbortController();
        setAbortController(newAbortController);
        setIsLoading(true);

        const pincode = "110001";
        const response = await fetchSearchSuggesstions(
          newAbortController.signal,
          selectedDetails?.lat || 28.6139,
          selectedDetails?.lng || 77.209,
          pincode,
          debouncedInput,
          domain
        );

        setSuggestions(response || []);
      } catch (error) {
        console.error("Error fetching search suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSuggestions();
    return () => {
      if (abortController) abortController.abort();
    };
  }, [debouncedInput, selectedDetails, domain]);

  // Storage helpers
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
      searches = searches.filter((s) => s !== searchTerm);
      searches.unshift(searchTerm);
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
      searches = searches.filter((s) => s !== searchTerm);
      await setAsyncStorageItem("recentSearches", JSON.stringify(searches));
      setRecentSearches(searches);
    } catch (err) {
      console.error("Error removing search term:", err);
    }
  };

  // Unified navigation
  const navigateToSearch = async (term: string): Promise<void> => {
    if (term.length < 3) return;
    await saveSearchTerm(term);
    router.push({
      pathname: "/(tabs)/home/result/[search]",
      params: {
        search: term,
        domainData: domain,
      },
    });
  };

  const handleSearchSubmit = async () => {
    await navigateToSearch(inputValue);
  };

  const handleSuggestionPress = async (suggestion: SuggestionsType) => {
    await saveSearchTerm(suggestion.name);
    if (suggestion.type === "store" || suggestion.type === "vendor") {
      router.push(`/(tabs)/home/result/productListing/${suggestion.slug}`);
    } else {
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

  const getImageSource = (symbolUrl: string | undefined) => {
    if (symbolUrl && symbolUrl.length > 0) return { uri: symbolUrl };
    return {
      uri: "https://res.cloudinary.com/doex3braa/image/upload/v1703058217/martpe/food/sihuigqn0bv4ustt4wyi.png",
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <Feather
            name="arrow-left"
            style={styles.headerLeftIcon}
            onPress={() => router.back()}
          />
          <Text style={{ ...Fonts.medium(16), color: Colors.BLACK_COLOR }}>
            Search anything you want
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
            placeholder={
              placeHolder || `Search for '${searchTexts[searchTextIndex]}'`
            }
            style={{
              height: 50,
              borderRadius: 10,
              flex: 1,
              paddingHorizontal: 10,
              color: "#8E8A8A",
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

      {/* Recent Searches */}
      {inputValue.length < 3 ? (
        <View style={styles.recentSearchContainer}>
          <Text style={styles.recentSearchHeader}>
            {recentSearches.length > 0
              ? "Recent Searches"
              : "Discover something new!"}
          </Text>
          <View style={styles.recentSearchItemsContainer}>
            {recentSearches.slice(0, 5).map((term, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => navigateToSearch(term)}
              >
                <Feather name="clock" size={13} color="#35374B" />
                <Text style={styles.recentSearchText}>
                  {term.length < 20 ? term : term.slice(0, 20) + "..."}
                </Text>
                <TouchableOpacity
                  onPress={() => removeSearchTerm(term)}
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
        // Suggestions
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
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                {suggestions.map((suggestion, index) => (
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
                ))}
              </ScrollView>
            </SafeAreaView>
          ) : (
            <View style={{ marginTop: 20, marginHorizontal: 20 }}>
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
    paddingVertical: 10,
    backgroundColor: Colors.WHITE_COLOR,
  },
  headerLeftIcon: {
    color: Colors.BLACK_COLOR,
    marginRight: 15,
    fontSize: 25,
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
  },
  recentSearchHeader: {
    marginVertical: 5,
    fontSize: 16,
  },
  recentSearchItem: {
    paddingVertical: width * 0.01,
    paddingHorizontal: 10,
    flexDirection: "row",
    borderRadius: 25,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
  },
  recentSearchText: {
    fontSize: 13,
    color: "#35374B",
    marginHorizontal: width * 0.01,
  },
});
