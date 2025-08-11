import React, { FC, useEffect, useState } from "react";
import { View, Text, Dimensions, ScrollView, Image, TouchableOpacity } from "react-native";
import { fetchProductVariants } from "../variants/fetch-product-variants";
import { ProductVariant } from "../variants/fetch-product-variants-type";

interface VariantGroupProps {
  slug: string;
  storeId: string;
  parentId: string;
  initialPrimaryVariant: string;
  variants: string[];
  selectedProductId: string;
}

const { width } = Dimensions.get("window");

const VariantGroup: FC<VariantGroupProps> = ({
  slug,
  storeId,
  parentId,
  initialPrimaryVariant,
  variants,
  selectedProductId,
}) => {
  const [PrimaryVariant, setPrimaryVariant] = useState(initialPrimaryVariant);
  const [convertedData, setConvertedData] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handlePrimaryVariant = (primaryVariant: string) => {
    setPrimaryVariant(primaryVariant);
    console.log("Selected Primary Variant:", primaryVariant);
  };

  useEffect(() => {
    const loadVariants = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const data = await fetchProductVariants(slug, storeId, parentId);
        if (data) {
          setConvertedData(data);
        }
      } catch (err) {
        console.error("Error loading variants:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadVariants();
  }, [slug, storeId, parentId]);

  if (isLoading) return null;
  if (error) return null;

  return (
    <View>
      {variants &&
        variants.map((variantKey, index) => {
          const seenAttributes = new Set();

          return (
            <View
              key={index}
              style={{
                backgroundColor: "#fff",
                flexDirection: "column",
                justifyContent: "space-between",
                paddingHorizontal: width * 0.05,
                paddingVertical: width * 0.03,
                marginHorizontal: width * 0.05,
                elevation: 5,
                borderRadius: 10,
                marginTop: width * 0.05,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "500", marginBottom: 10 }}>
                Available {variantKey}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {convertedData
                  .filter((item) => {
                    const attributeValue = item.attributes?.[variantKey as keyof typeof item.attributes];
                    if (seenAttributes.has(attributeValue)) {
                      return false;
                    } else {
                      seenAttributes.add(attributeValue);
                      return true;
                    }
                  })
                  .map((item, idx) => {
                    const attributeValue = item.attributes?.[variantKey as keyof typeof item.attributes];
                    const isSelected = PrimaryVariant === attributeValue;

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handlePrimaryVariant(attributeValue || "")}
                        style={{
                          marginRight: 10,
                          alignItems: "center",
                          borderWidth: isSelected ? 2 : 1,
                          borderColor: isSelected ? "#FB3E44" : "#ccc",
                          padding: 5,
                          borderRadius: 8,
                        }}
                      >
                        <Image
                          source={{ uri: item.symbol }}
                          style={{
                            width: 80,
                            height: 80,
                            borderRadius: 8,
                            marginBottom: 5,
                          }}
                        />
                        <Text>{attributeValue}</Text>
                        <Text>
                          {item.price?.currency} {item.price?.value}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          );
        })}
    </View>
  );
};

export default VariantGroup;
