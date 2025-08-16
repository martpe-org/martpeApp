import React from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import {
  personalCareCategoryData,
  electronicsCategoryData,
  foodCategoryData,
  groceriesCategoryData,
  homeAndDecorCategoryData,
  fashionCategoryData,
  getCategoryColor,
} from "../../../constants/categories";
import { router, useLocalSearchParams } from "expo-router";
import ImageComp from "../../../components/common/ImageComp";
import { BackArrow } from "../../../constants/icons/tabIcons";

const { width: screenWidth } = Dimensions.get("window");

const AllCategories = () => {
  const { category } = useLocalSearchParams();

  // Handle category parameter more safely
  const categoryString = Array.isArray(category) ? category[0] : category || "";
  const categoryColor = getCategoryColor(categoryString);

  const header = (title: string) => (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#FFF",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingVertical: 10,
        paddingHorizontal: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ 
          zIndex: 10, 
          padding: 10, 
          marginLeft: 15,
          borderRadius: 20,
        }}
        activeOpacity={0.7}
      >
        <BackArrow />
      </TouchableOpacity>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 50, // Compensate for back button
        }}
      >
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 18,
            color: "#333",
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );

  const displayCategoriesData = (
    categoryData: any[],
    categoryColor: string,
    domain: string
  ) => {
    if (!categoryData || categoryData.length === 0) {
      return (
        <View style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 50,
        }}>
          <Text style={{
            fontSize: 16,
            color: "#666",
            textAlign: "center",
          }}>
            No categories available
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        style={{
          backgroundColor: "#fff",
          flex: 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: screenWidth * 0.03,
          paddingVertical: 20,
          paddingBottom: 100, // Extra bottom padding
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}>
          {categoryData.map((item, index) => (
            <TouchableOpacity
              onPress={() => {
                const searchParams: any = {
                  search: item?.name,
                };
                if (domain && domain !== "") {
                  searchParams.domainData = domain;
                }
                router.push({
                  pathname: "/(tabs)/home/result/[search]",
                  params: searchParams,
                });
              }}
              key={index}
              style={{
                width: screenWidth * 0.44, // Slightly less than half for better spacing
                marginBottom: 20,
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 10,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
              activeOpacity={0.8}
            >
              <View
                style={{
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <ImageComp
                  source={{
                    uri: item.image,
                  }}
                  imageStyle={{
                    height: screenWidth * 0.25,
                    width: screenWidth * 0.25,
                    borderRadius: 8,
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text
                style={{
                  color: "#3D3B40",
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: "600",
                  lineHeight: 16,
                }}
                numberOfLines={2}
              >
                {item?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Determine title, categoryData, and domain based on category
  let title = "All Categories";
  let categoryData: any[] = [];
  let domain = "";

  switch (categoryString) {
    case "personalCare":
      title = "Personal Care";
      categoryData = personalCareCategoryData;
      domain = "ONDC:RET13";
      break;
    case "electronics":
      title = "Electronics";
      categoryData = electronicsCategoryData;
      domain = "ONDC:RET14";
      break;
    case "food":
      title = "Food & Beverages";
      categoryData = foodCategoryData;
      domain = "ONDC:RET11";
      break;
    case "groceries":
      title = "Groceries";
      categoryData = groceriesCategoryData;
      domain = "ONDC:RET10";
      break;
    case "homeAndDecor":
      title = "Home & Decor";
      categoryData = homeAndDecorCategoryData;
      domain = "ONDC:RET16";
      break;
    case "fashion":
      title = "Fashion";
      categoryData = fashionCategoryData;
      domain = "ONDC:RET12";
      break;
    default:
      title = "All Categories";
      categoryData = [];
      domain = "";
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f8f9fa",
      }}
    >
      {header(title)}
      {displayCategoriesData(categoryData, categoryColor, domain)}
    </View>
  );
};

export default AllCategories;