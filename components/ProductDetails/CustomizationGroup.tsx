import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import AddToCart from "./AddToCart";
import { AntDesign, Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";

//
// ---------------- TYPES ----------------
//
export interface SelectedCustomizationType {
  groupId: string;
  optionId: string;
  name: string;
}

interface CustomizationOption {
  child?: { id: string };
  descriptor: { name: string };
  price?: { value: number };
  quantity?: { available: { count: number } };
  related?: string;
  type?: string;
  group?: { default?: boolean; id: string };
  tags?: {
    code: string;
    list: { code: string; value: string }[];
  }[];
}

interface CustomizationData {
  descriptor: { name: string };
  options: CustomizationOption[];
  custom_group_id: string;
  config: {
    input: "text" | "select";
    max: number;
    min: number;
    seq: number;
  };
}

interface CustomizationGroupProps {
  customizable: boolean;
  customGroup: string[] | null;
  vendorId: string | string[];
  price: number;
  itemId: string; // slug or catalogId
  maxLimit: number;
  closeFilter: () => void;
}

//
// ---------------- MOCK FETCH ----------------
// (replace this with your actual API call)
//
const fetchCustomizations = async (
  customGroup: string[],
  vendorId: string
): Promise<CustomizationData[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // simulate API delay

  return [
    {
      descriptor: { name: "Size Options" },
      options: [
        {
          descriptor: { name: "Small" },
          group: { id: "size_1" },
          price: { value: 0 },
        },
        {
          descriptor: { name: "Medium" },
          group: { id: "size_2" },
          price: { value: 50 },
        },
        {
          descriptor: { name: "Large" },
          group: { id: "size_3" },
          price: { value: 100 },
        },
      ],
      custom_group_id: customGroup[0],
      config: { input: "select", max: 1, min: 1, seq: 1 },
    },
  ];
};

//
// ---------------- COMPONENT ----------------
//
const CustomizationGroup: FC<CustomizationGroupProps> = ({
  customizable,
  customGroup,
  vendorId,
  price,
  itemId,
  maxLimit,
  closeFilter,
}) => {
  const [activeCustomGroup, setActiveCustomGroup] = useState<string>(
    customGroup?.[0] || ""
  );
  const [nextCustomGroup, setNextCustomGroup] = useState<string>("");
  const [selectedCustomizations, setSelectedCustomizations] = useState<
    SelectedCustomizationType[]
  >([]);
  const [finalCustomizations, setFinalCustomizations] = useState<
    SelectedCustomizationType[][]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<CustomizationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<number>(0);
  const [selected, setSelected] = useState<string>("");
  const [multipleSelected, setMultipleSelected] = useState<string[]>([]);

  //
  // Fetch customization data
  //
  useEffect(() => {
    const loadCustomizations = async () => {
      if (!customGroup || !vendorId) return;

      try {
        setIsLoading(true);
        setError(null);
        const result = await fetchCustomizations(customGroup, vendorId as string);
        setData(result);
      } catch (err) {
        setError("Failed to load customizations");
        console.error("Error fetching customizations:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomizations();
  }, [customGroup, vendorId]);

  //
  // Reset on group change
  //
  useEffect(() => {
    if (customGroup?.[0]) {
      setActiveCustomGroup(customGroup[0]);
    }
    setSelectedCustomizations([]);
    setFinalCustomizations([]);
    setStep(0);
  }, [customGroup]);

  //
  // Handle adding a customization
  //
  const handleAddCustomization = (
    activeCustomGroup: string | null,
    customizationId: string,
    name: string
  ) => {
    if (!customizationId) return;

    const newSelection: SelectedCustomizationType = {
      groupId: activeCustomGroup || "",
      optionId: customizationId,
      name,
    };

    setSelectedCustomizations((prev) => {
      if (prev.find((c) => c.optionId === customizationId)) {
        return prev.filter((c) => c.optionId !== customizationId);
      }
      return [...prev, newSelection];
    });

    setNextCustomGroup(activeCustomGroup ?? "end");
  };

  //
  // Go to next step
  //
  const handleNext = () => {
    setFinalCustomizations((prev) => [...prev, selectedCustomizations]);

    if (nextCustomGroup !== "end") {
      setActiveCustomGroup(nextCustomGroup);
      setStep((prevStep) => prevStep + 1);
    } else {
      console.log("Final Customizations:", finalCustomizations);
    }
  };

  //
  // Go back step
  //
  const handlePrevious = () => {
    setFinalCustomizations((prev) => prev.slice(0, -1));
    setActiveCustomGroup(customGroup?.[step - 1] || customGroup?.[0] || "");
    setStep((prevStep) => (prevStep > 0 ? prevStep - 1 : 0));
  };

  //
  // UI states
  //
  if (customGroup === null) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FB3E44" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "red" }}>
          We could not find any customizations
        </Text>
      </View>
    );
  }

  //
  // Render UI
  //
  return (
    <View
      style={{
        paddingHorizontal: Dimensions.get("screen").width * 0.03,
        height: "100%",
        flex: 1,
      }}
    >
      {customizable && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "600",
              paddingVertical: Dimensions.get("screen").width * 0.04,
            }}
          >
            Customize as per your taste
          </Text>
          <TouchableOpacity onPress={closeFilter}>
            <AntDesign name="close" size={18} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <View style={{ borderBottomColor: "black", borderBottomWidth: 0.2 }} />

      {data.map((item, idx) =>
        item.custom_group_id === activeCustomGroup ? (
          <View key={idx}>
            <Text
              style={{
                fontSize: 16,
                paddingVertical: 10,
                fontWeight: "500",
              }}
            >
              {item.descriptor.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                paddingVertical: 10,
                fontWeight: "400",
              }}
            >
              {item.config.input} up to {item.config.max} option(s)
            </Text>

            <View
              style={{
                backgroundColor: "white",
                elevation: 2,
                paddingHorizontal: 10,
                minHeight: 100,
                borderRadius: 10,
              }}
            >
              {item.options.map((option, idx2) => (
                <Pressable
                  key={idx2}
                  onPress={() =>
                    handleAddCustomization(
                      item.custom_group_id,
                      option?.group?.id || "",
                      option.descriptor.name
                    )
                  }
                >
                  {item.config.input === "select" && item.config.max === 1 && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: 10,
                      }}
                    >
                      <Text>{option.descriptor.name}</Text>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderColor:
                            selected === option.descriptor.name
                              ? "#FB3E44"
                              : "#ACAAAA",
                          borderWidth: 1.5,
                          borderRadius: 15,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {selected === option.descriptor.name && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              backgroundColor: "#FB3E44",
                              borderRadius: 15,
                            }}
                          />
                        )}
                      </View>
                    </View>
                  )}

                  {item.config.input === "select" && item.config.max > 1 && (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginVertical: 10,
                      }}
                    >
                      <Text>{option.descriptor.name}</Text>
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderColor: multipleSelected.includes(
                            option.descriptor.name
                          )
                            ? "#FB3E44"
                            : "#ACAAAA",
                          borderWidth: 1.5,
                          borderRadius: 2,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {multipleSelected.includes(option.descriptor.name) && (
                          <Feather name="check" size={12} color="#FB3E44" />
                        )}
                      </View>
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Bottom buttons */}
            <View
              style={{
                position: "absolute",
                width: "100%",
                bottom: -Dimensions.get("screen").width * 0.6,
              }}
            >
              {item?.options[step]?.child?.id ? (
                <View>
                  {step > 0 && (
                    <TouchableOpacity
                      onPress={handlePrevious}
                      style={{
                        backgroundColor: "#FB3E44",
                        padding: 12,
                        borderRadius: 4,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Previous
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={handleNext}
                    style={{
                      backgroundColor: "#0e8910",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "600" }}>
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {step > 0 && (
                    <TouchableOpacity
                      onPress={handlePrevious}
                      style={{
                        backgroundColor: "#FB3E44",
                        padding: 12,
                        borderRadius: 4,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "600" }}>
                        Previous
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Final Add to Cart */}
                  <AddToCart
                    price={price}
                    storeId={vendorId as string}
                    slug={itemId}
                    catalogId={itemId}
                    customizable={true}
                    customizations={finalCustomizations.flat()} // flatten to one array
                  />
                </>
              )}
            </View>
          </View>
        ) : null
      )}
    </View>
  );
};

export default CustomizationGroup;
