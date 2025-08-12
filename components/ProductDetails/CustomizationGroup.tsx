import React, { FC, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Pressable,
} from "react-native";
import AddToCart from "./AddToCart";

import { MaterialCommunityIcons, AntDesign, Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";

// Types for the customization data
interface CustomizationOption {
  child?: {
    id: string;
  };
  descriptor: {
    name: string;
  };
  price?: {
    value: number;
  };
  quantity?: {
    available: {
      count: number;
    };
  };
  related?: string;
  type?: string;
  group?: {
    default?: boolean;
    id: string;
  };
  tags?: {
    code: string;
    list: {
      code: string;
      value: string;
    }[];
  }[];
}

interface CustomizationData {
  descriptor: {
    name: string;
  };
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
  providerId: string;
  domain: string;
  cityCode: string;
  bppId: string;
  vendorId: string | string[];
  price: number;
  itemId: string;
  maxLimit: number;
  closeFilter: () => void;
}

// Mock function to simulate API call - replace with your actual API call
const fetchCustomizations = async (customGroup: string[], vendorId: string): Promise<CustomizationData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data - replace with actual API call
  return [
    {
      descriptor: {
        name: "Size Options"
      },
      options: [
        {
          descriptor: { name: "Small" },
          group: { id: "size_1" },
          price: { value: 0 }
        },
        {
          descriptor: { name: "Medium" },
          group: { id: "size_2" },
          price: { value: 50 }
        },
        {
          descriptor: { name: "Large" },
          group: { id: "size_3" },
          price: { value: 100 }
        }
      ],
      custom_group_id: customGroup[0],
      config: {
        input: "select",
        max: 1,
        min: 1,
        seq: 1
      }
    }
  ];
};

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
  const [selectedCustomizations, setSelectedCustomizations] = useState<Array<string>>([]);
  const [finalCustomizations, setFinalCustomizations] = useState<Array<{}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<CustomizationData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<number>(0);
  const [selected, setSelected] = useState<string>("");
  const [multipleSelected, setMultipleSelected] = useState<string[]>([]);
  const [addedSelected, setAddedSelected] = useState<any[]>([]);

  // Fetch customizations data
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

  useEffect(() => {
    if (customGroup?.[0]) {
      setActiveCustomGroup(customGroup[0]);
    }
    setSelectedCustomizations([]);
    setFinalCustomizations([]);
    setStep(0);
    console.log("customizable", customGroup, vendorId, step);
    console.log("selectedCustomizations", activeCustomGroup, selectedCustomizations);
  }, [customGroup]);

  const handleAddCustomization = (
    activeCustomGroup: string | null,
    customizationId: string
  ) => {
    if (customizationId === null) {
      setSelectedCustomizations([...selectedCustomizations]);
    } else {
      setSelectedCustomizations((selected) => {
        if (selected.includes(customizationId)) {
          return selected.filter((id) => id !== customizationId);
        } else {
          return [...selected, customizationId];
        }
      });
    }

    if (activeCustomGroup === null) {
      setNextCustomGroup("end");
    } else {
      setNextCustomGroup(activeCustomGroup);
    }

    console.log("selectedCustomizations", selectedCustomizations);
  };

  const handleNext = () => {
    const newFinalCustomizations = [
      ...finalCustomizations,
      selectedCustomizations,
    ];
    setFinalCustomizations(newFinalCustomizations);

    if (nextCustomGroup !== "end") {
      setActiveCustomGroup(nextCustomGroup);
      setStep((prevStep) => prevStep + 1);
    } else {
      // Handle the case where there are no more customizations
      console.log("Final Customizations:", newFinalCustomizations);
    }
  };

  const handlePrevious = () => {
    const newFinalCustomizations = finalCustomizations.slice(0, -1);
    setFinalCustomizations(newFinalCustomizations);

    setActiveCustomGroup(customGroup?.[step - 1] || customGroup?.[0] || "");
    setStep((prevStep) => (prevStep > 0 ? prevStep - 1 : 0));
  };

  if (customGroup === null) return null;
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FB3E44" />
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 16, color: 'red' }}>We could not find any customizations</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: Dimensions.get("screen").width * 0.03,
        height: "100%",
        flex: 1,
      }}
    >
      {customizable ? (
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
            <AntDesign
              name="close"
              size={18}
              style={{ fontWeight: "600" }}
              color="black"
            />
          </TouchableOpacity>
        </View>
      ) : null}

      <View
        style={{
          borderBottomColor: "black",
          borderBottomWidth: 0.2,
        }}
      />
      
      {data.map((item, idx) => {
        return (
          <View key={idx}>
            {item.custom_group_id === activeCustomGroup ? (
              <View>
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
                  {item.config.input} upto {item.config.max} option
                </Text>
                <View
                  style={{
                    backgroundColor: "white",
                    elevation: 2,
                    shadowColor: "grey",
                    shadowOffset: { width: 0, height: 2 },
                    paddingHorizontal: 10,
                    minHeight: 100,
                    borderRadius: 10,
                  }}
                >
                  {item.options.map((option, idx) => {
                    return (
                      <View key={idx}>
                        <Pressable
                          onPress={() => {
                            handleAddCustomization(
                              option?.child?.id || null,
                              option?.group?.id || ""
                            );
                            if (item.config.max > 1) {
                              setMultipleSelected((currentSelected) => {
                                if (
                                  currentSelected.includes(option.descriptor.name) ||
                                  multipleSelected.length >= item.config.max
                                ) {
                                  return currentSelected.filter(
                                    (name) => name !== option.descriptor.name
                                  );
                                } else {
                                  return [...currentSelected, option.descriptor.name];
                                }
                              });
                            } else {
                              setSelected(option.descriptor.name);
                            }
                          }}
                        >
                          {item.config.input === "text" ? (
                            <>
                              <Text>{option.descriptor.name}</Text>
                              <TextInput
                                placeholder="Enter your customizations"
                                style={{
                                  borderBottomWidth: 1,
                                  borderBottomColor: "gray",
                                }}
                              />
                            </>
                          ) : null}
                          
                          {item.config.input === "select" && item.config.max === 1 ? (
                            <View
                              style={{
                                flexDirection: "row",
                                width: Dimensions.get("screen").width * 0.88,
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
                          ) : null}
                          
                          {item.config.input === "select" && item.config.max > 1 ? (
                            <View
                              style={{
                                flexDirection: "row",
                                width: Dimensions.get("screen").width * 0.88,
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
                          ) : null}
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
                
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
                          onPress={() => {
                            setActiveCustomGroup(
                              selectedCustomizations[step - 1]
                            );
                            setStep(step - 1);
                            handlePrevious();
                          }}
                          style={{
                            backgroundColor: "#FB3E44",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: Dimensions.get("screen").width * 0.05,
                            paddingVertical: Dimensions.get("screen").width * 0.03,
                            borderRadius: 4,
                            marginBottom: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                              fontWeight: "600",
                            }}
                          >
                            Previous
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => {
                          setActiveCustomGroup(nextCustomGroup);
                          setAddedSelected([...addedSelected, selectedCustomizations]);
                          setStep(step + 1);
                          handleNext();
                          console.log(finalCustomizations, "finalCustomizations");
                        }}
                        style={{
                          backgroundColor: "#0e8910",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          paddingHorizontal: Dimensions.get("screen").width * 0.05,
                          paddingVertical: Dimensions.get("screen").width * 0.03,
                          borderRadius: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 16,
                            fontWeight: "600",
                          }}
                        >
                          Next
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      {step > 0 && (
                        <TouchableOpacity
                          onPress={() => {
                            setActiveCustomGroup(
                              selectedCustomizations[step - 1]
                            );
                            setStep(step - 1);
                            handlePrevious();
                          }}
                          style={{
                            backgroundColor: "#FB3E44",
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            paddingHorizontal: Dimensions.get("screen").width * 0.05,
                            paddingVertical: Dimensions.get("screen").width * 0.03,
                            borderRadius: 4,
                            marginBottom: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: "white",
                              fontSize: 16,
                              fontWeight: "600",
                            }}
                          >
                            Previous
                          </Text>
                        </TouchableOpacity>
                      )}
                      <AddToCart
                        price={price}
                        storeId={vendorId as string}
                        itemId={itemId}
                        maxLimit={maxLimit}
                      />
                    </>
                  )}
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

export default CustomizationGroup;