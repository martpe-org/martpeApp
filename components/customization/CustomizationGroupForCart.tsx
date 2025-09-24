import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import useUserDetails from '../../hook/useUserDetails';
import { useToast } from 'react-native-toast-notifications';
import { fetchProductCustomizations } from '../customization/fetch-product-customizations';
import Loader from '../common/Loader';
import WrapperSheetForCart from './WrapperSheetForCart';
import { updateCartItemCustomizationsAction } from './updateCustomizations';

interface CustomizationGroupForCartProps {
  cartItemId: string;
  productSlug: string;
  storeId: string;
  catalogId: string;
  productPrice: number;
  directlyLinkedCustomGroupIds: string[];
  existingCustomizations?: any[];
  visible: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  productName?: string;
}

export type SelectedOptionsType = {
  [groupId: string]: {
    groupId: string;
    optionId: string;
    name: string;
  }[];
};

const CustomizationGroupForCart: React.FC<CustomizationGroupForCartProps> = ({
  cartItemId,
  productSlug,
  storeId,
  catalogId,
  productPrice,
  directlyLinkedCustomGroupIds,
  existingCustomizations = [],
  visible,
  onClose,
  onUpdateSuccess,
  productName,
}) => {
  const [customizationData, setCustomizationData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsType>({});
  const [history, setHistory] = useState<{
    groups: string[];
    selectedOptions: SelectedOptionsType;
  }[]>([{ groups: directlyLinkedCustomGroupIds, selectedOptions: {} }]);
  const [step, setStep] = useState(0);
  const [currentGroupIds, setCurrentGroupIds] = useState<string[]>(directlyLinkedCustomGroupIds);

  const { userDetails } = useUserDetails();
  const toast = useToast();

  // Convert existing customizations to selectedOptions format
  const convertExistingCustomizations = useCallback((customizations: any[], data: Record<string, any>) => {
    const converted: SelectedOptionsType = {};
    
    customizations.forEach((customization) => {
      if (customization.groupId && customization.optionId && customization.name) {
        const groupId = customization.groupId.replace('cg_', '');
        
        if (!converted[groupId]) {
          converted[groupId] = [];
        }
        
        converted[groupId].push({
          groupId,
          optionId: customization.optionId.replace('ci_', ''),
          name: customization.name,
        });
      }
    });
    
    return converted;
  }, []);

  useEffect(() => {
    const fetchCustomizations = async () => {
      if (!visible || !productSlug) return;

      try {
        setLoading(true);
        const data = await fetchProductCustomizations(productSlug);
        
        if (data) {
          setCustomizationData(data);
          
          // Convert existing customizations or set defaults
          if (existingCustomizations.length > 0) {
            const existingOptions = convertExistingCustomizations(existingCustomizations, data);
            setSelectedOptions(existingOptions);
          } else {
            // Set default options if no existing customizations
            const groupIdDefaultOptionMap: SelectedOptionsType = {};
            directlyLinkedCustomGroupIds.forEach((gid) => {
              const group = data[`cg_${gid}`];
              if (group) {
                group.options.forEach((optionId: string) => {
                  const option = group[`ci_${optionId}`];
                  if (option.isDefaultOption) {
                    groupIdDefaultOptionMap[gid] = [
                      { groupId: gid, optionId, name: option.name },
                    ];
                  }
                });
              }
            });

            if (Object.keys(groupIdDefaultOptionMap).length > 0) {
              setSelectedOptions(groupIdDefaultOptionMap);
            }
          }
          setStep(0);
        }
      } catch (error) {
        console.error('Error fetching customizations:', error);
        toast.show('Failed to load customizations', { type: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizations();
  }, [visible, productSlug, existingCustomizations, convertExistingCustomizations, directlyLinkedCustomGroupIds]);

  const handleOptionChange = useCallback(
    (groupId: string, optionId: string, name: string) => {
      const currentGroup = customizationData?.[`cg_${groupId}`];
      if (!currentGroup) return;

      if (Number(currentGroup.config.max) > 1) {
        // Multi-select logic
        setSelectedOptions((prev) => ({
          ...prev,
          [groupId]: prev[groupId]
            ? prev[groupId].find((o) => o.optionId === optionId)
              ? prev[groupId].filter((o) => o.optionId !== optionId)
              : [...prev[groupId], { groupId, optionId, name }]
            : [{ groupId, optionId, name }],
        }));
      } else {
        // Single-select logic
        setSelectedOptions((prev) => ({
          ...prev,
          [groupId]: [{ groupId, optionId, name }],
        }));
      }
    },
    [customizationData]
  );

  const handlePrevious = () => {
    if (step > 0) {
      const previousState = history[step - 1];
      setCurrentGroupIds(previousState.groups);
      setSelectedOptions(previousState.selectedOptions);
      setStep((prevStep) => prevStep - 1);
    }
  };

  const handleNext = () => {
    if (!customizationData) return;

    // Get all child group IDs from selected options
    const childGroupIds = new Set<string>();
    currentGroupIds.forEach((groupId) => {
      const selectedGroupOptions = selectedOptions[groupId] || [];
      selectedGroupOptions.forEach((option) => {
        const optionData = customizationData[`cg_${groupId}`][`ci_${option.optionId}`];
        if (optionData?.child_group_ids) {
          optionData.child_group_ids.forEach((id: string) => childGroupIds.add(id));
        }
      });
    });

    if (childGroupIds.size > 0) {
      const newGroupIds = Array.from(childGroupIds);
      setCurrentGroupIds(newGroupIds);

      // Set default options for new groups
      const groupIdDefaultOptionMap: SelectedOptionsType = {};
      newGroupIds.forEach((gid) => {
        const group = customizationData[`cg_${gid}`];
        if (group) {
          group.options.forEach((optionId: string) => {
            const option = group[`ci_${optionId}`];
            if (option.isDefaultOption) {
              groupIdDefaultOptionMap[gid] = [
                { groupId: gid, optionId, name: option.name },
              ];
            }
          });
        }
      });

      if (Object.keys(groupIdDefaultOptionMap).length > 0) {
        setSelectedOptions((prev) => ({
          ...prev,
          ...groupIdDefaultOptionMap,
        }));
      }

      setHistory((prev) => [
        ...prev,
        { groups: newGroupIds, selectedOptions: { ...selectedOptions } },
      ]);
      setStep((prevStep) => prevStep + 1);
    }
  };

  const isNextDisabled = useCallback(() => {
    if (!customizationData) return true;

    return currentGroupIds.some((groupId) => {
      const group = customizationData[`cg_${groupId}`];
      if (!group) return true;

      const selectedCount = selectedOptions[groupId]?.length || 0;
      return selectedCount < Number(group.config.min);
    });
  }, [customizationData, currentGroupIds, selectedOptions]);



const handleUpdateCustomizations = async () => {
  try {
    setUpdating(true);

    // ✅ prepare payload
    const customizationPayload = Object.entries(selectedOptions).flatMap(
      ([groupId, options]) =>
        options.map((option) => ({
          groupId: `cg_${groupId}`,
          optionId: `ci_${option.optionId}`,
          name: option.name,
        }))
    );

    // ✅ call RN action
    const result = await updateCartItemCustomizationsAction(
      cartItemId,
      1, // qty (if you also want to allow qty change, pass that instead of 1)
      productSlug,
      productPrice,
      customizationPayload
    );

    if (result.success) {
      onUpdateSuccess();
      onClose();
      toast.show("Customizations updated successfully", { type: "success" });
    } else {
      toast.show("Failed to update customizations", { type: "danger" });
    }
  } catch (error) {
    console.error("Error updating customizations:", error);
    toast.show("Error updating customizations", { type: "danger" });
  } finally {
    setUpdating(false);
  }
};

  const handleClearGroup = (groupId: string) => {
    setSelectedOptions((prev) => {
      const updated = { ...prev };
      delete updated[groupId];
      return updated;
    });
  };

  const hasChildGroups = currentGroupIds.some((groupId) => {
    const group = customizationData?.[`cg_${groupId}`];
    if (!group) return false;

    return group.options.some((optionId: string) => {
      const option = group[`ci_${optionId}`];
      return option?.child_group_ids && option.child_group_ids.length > 0;
    });
  });

  const showUpdateButton = !hasChildGroups || (step !== 0 && step === history.length - 1);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader/>
        <Text style={styles.loadingText}>Loading customizations...</Text>
      </View>
    );
  }

  if (!customizationData) {
    return <View></View>;
  }

  return (
<WrapperSheetForCart
  visible={visible}
  onClose={onClose}
  productName={productName}
  currentGroupIds={currentGroupIds}
  customizationData={customizationData}
  selectedOptions={selectedOptions}
  step={step}
  onOptionChange={handleOptionChange}
  onClearGroup={handleClearGroup}
  onPrevious={handlePrevious}
  onNext={handleNext}
  onUpdateCart={handleUpdateCustomizations}
  isNextDisabled={isNextDisabled}
  hasChildGroups={hasChildGroups}
  showUpdateButton={showUpdateButton}
  updating={updating}
/>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default CustomizationGroupForCart;