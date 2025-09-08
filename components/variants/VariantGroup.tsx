import React, { FC, useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchProductVariants } from "./fetch-product-variants";
import { ProductVariant } from "./fetch-product-variants-type";

interface VariantGroupProps {
  slug: string;
  storeId: string;
  parentId: string;
  initialPrimaryVariant: string;
  variants: string[];
  selectedProductId: string;
  onVariantSelect?: (variant: ProductVariant) => void; // ✅ callback
}

const { width } = Dimensions.get("window");

const VariantGroup: FC<VariantGroupProps> = ({
  slug,
  storeId,
  parentId,
  initialPrimaryVariant,
  variants,
  selectedProductId,
  onVariantSelect,
}) => {
  const [primaryVariant, setPrimaryVariant] = useState(initialPrimaryVariant);
  const [convertedData, setConvertedData] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handlePrimaryVariant = (
    variant: ProductVariant,
    attributeValue: string
  ) => {
    setPrimaryVariant(attributeValue);
    onVariantSelect?.(variant); // ✅ send selected variant up
  };

  useEffect(() => {
    const loadVariants = async () => {
      try {
        setIsLoading(true);
        setError(false);

        const data = await fetchProductVariants(slug, storeId, parentId);
        if (data) setConvertedData(data);
      } catch (err) {
        console.error("Error loading variants:", err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadVariants();
  }, [slug, storeId, parentId]);

  if (isLoading || error) return null;

  return (
    <View>
      {variants.map((variantKey, index) => {
        const seenAttributes = new Set();

        return (
          <View key={index} style={styles.variantGroupCard}>
            <Text style={styles.variantTitle}>Available {variantKey}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {convertedData
                .filter((item) => {
                  const attributeValue =
                    item.attributes?.[
                      variantKey as keyof typeof item.attributes
                    ];
                  if (seenAttributes.has(attributeValue)) return false;
                  seenAttributes.add(attributeValue);
                  return true;
                })
                .map((item, idx) => {
                  const attributeValue =
                    item.attributes?.[
                      variantKey as keyof typeof item.attributes
                    ];
                  const isSelected = primaryVariant === attributeValue;

                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() =>
                        handlePrimaryVariant(item, attributeValue || "")
                      }
                      style={[
                        styles.variantCard,
                        isSelected && styles.variantCardSelected,
                      ]}
                    >
                      <Image
                        source={{ uri: item.symbol }}
                        style={styles.variantImage}
                      />
                      <Text
                        style={[
                          styles.variantText,
                          isSelected && styles.variantTextSelected,
                        ]}
                      >
                        {attributeValue}
                      </Text>
                      <Text style={styles.priceText}>
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

const styles = StyleSheet.create({
  variantGroupCard: {
    backgroundColor: "#fff",
    paddingHorizontal: width * 0.05,
    paddingVertical: width * 0.04,
    marginHorizontal: width * 0.05,
    marginTop: width * 0.05,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  variantTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111",
  },
  variantCard: {
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#fafafa",
    width: 100,
  },
  variantCardSelected: {
    borderColor: "#FB3E44",
    backgroundColor: "#FFF4F4",
  },
  variantImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
  },
  variantText: {
    fontSize: 14,
    color: "#333",
  },
  variantTextSelected: {
    fontWeight: "600",
    color: "#FB3E44",
  },
  priceText: {
    fontSize: 12,
    marginTop: 2,
    color: "#666",
  },
});
