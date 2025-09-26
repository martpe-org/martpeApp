import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import useUserDetails from '../../hook/useUserDetails';
import { useCartStore } from '../../state/useCartStore';
import Loader from '../common/Loader';
import { fetchProductCustomizations } from './fetch-product-customizations';
import { updateCartItemCustomizationsAction } from './updateCustomizations';
import EditCustomizationSheet from './EditCustomizationSheet';


interface EditCustomizationProps {
  cartItemId: string;
  productSlug: string;
  storeId: string;
  catalogId: string;
  productPrice: number;
  currentQty: number;
  directlyLinkedCustomGroupIds?: string[];
  visible: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  productName?: string;
  existingCustomizations?: any[];
}

export type SelectedOptionsType = {
  [groupId: string]: {
    groupId: string;
    optionId: string;
    name: string;
  }[];
};

const EditCustomization: React.FC<EditCustomizationProps> = ({
  cartItemId,
  productSlug,
  storeId,
  catalogId,
  productPrice,
  currentQty,
  directlyLinkedCustomGroupIds = [],
  visible,
  onClose,
  onUpdateSuccess,
  productName,
  existingCustomizations = [],
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
  const [currentGroupIds, setCurrentGroupIds] = useState<string[]>(directlyLinkedCustomGroupIds || []);

  const { syncCartFromApi } = useCartStore();
  const { userDetails } = useUserDetails();
  const toast = useToast();

  // Load existing customizations into selected options format
  const loadExistingCustomizations = useCallback((data: Record<string, any>) => {
    if (!existingCustomizations?.length) return;

    const existingOptions: SelectedOptionsType = {};
    
    existingCustomizations.forEach((customization) => {
      // Extract group ID and option ID from the customization
      const groupId = customization.groupId?.replace('cg_', '') || '';
      const optionId = customization.optionId?.replace('ci_', '') || '';
      
      if (groupId && optionId) {
        const group = data[`cg_${groupId}`];
        if (group) {
          const option = group[`ci_${optionId}`];
          if (option) {
            if (!existingOptions[groupId]) {
              existingOptions[groupId] = [];
            }
            existingOptions[groupId].push({
              groupId,
              optionId,
              name: option.name || customization.name,
            });
          }
        }
      }
    });

    if (Object.keys(existingOptions).length > 0) {
      setSelectedOptions(existingOptions);
    }
  }, [existingCustomizations]);

  useEffect(() => {
    const fetchCustomizations = async () => {
      if (!visible || !productSlug) return;

      try {
        setLoading(true);
        const data = await fetchProductCustomizations(productSlug);

        if (data) {
          setCustomizationData(data);

          // Load existing customizations first
          loadExistingCustomizations(data);

          // Then set default options for any missing groups
          const groupIdDefaultOptionMap: SelectedOptionsType = {};
          directlyLinkedCustomGroupIds.forEach((gid) => {
            // Skip if we already have selections for this group from existing customizations
            if (selectedOptions[gid]?.length > 0) return;

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
            setSelectedOptions((prev) => ({
              ...prev,
              ...groupIdDefaultOptionMap,
            }));
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
  }, [visible, productSlug, directlyLinkedCustomGroupIds, loadExistingCustomizations]);

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
    if (!userDetails?.accessToken) {
      toast.show('Please login to continue', { type: 'danger' });
      return;
    }

    try {
      setUpdating(true);
      
      // Format customizations for the API
      const formattedCustomizations = Object.entries(selectedOptions).flatMap(([groupId, options]) =>
        options.map((option) => ({
          groupId: `cg_${groupId}`,
          optionId: `ci_${option.optionId}`,
          name: option.name,
        }))
      );

      const { success } = await updateCartItemCustomizationsAction(
        cartItemId,
        currentQty,
        productSlug,
        productPrice,
        formattedCustomizations
      );

      if (success) {
        // Sync cart data from API to get updated prices
        await syncCartFromApi(userDetails.accessToken);
        toast.show('Customizations updated successfully', { type: 'success' });
        onUpdateSuccess();
        onClose();
      } else {
        toast.show('Failed to update customizations', { type: 'danger' });
      }
    } catch (error) {
      console.error('Error updating customizations:', error);
      toast.show('Error updating customizations', { type: 'danger' });
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

  const hasChildGroups = (currentGroupIds || []).some((groupId) => {
    const group = customizationData?.[`cg_${groupId}`];
    if (!group || !Array.isArray(group.options)) return false;

    return group.options.some((optionId: string) => {
      const option = group[`ci_${optionId}`];
      return option?.child_group_ids && option.child_group_ids.length > 0;
    });
  });

  const showUpdateButton = !hasChildGroups || (step !== 0 && step === history.length - 1);

  if (loading) {
    return (
        <Loader />
  
    );
  }

  if (!customizationData) {
    return <View></View>;
  }

  return (
    <EditCustomizationSheet
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
      onUpdateCustomizations={handleUpdateCustomizations}
      isNextDisabled={isNextDisabled}
      hasChildGroups={hasChildGroups}
      showUpdateButton={showUpdateButton}
      updating={updating}
    />
  );
};

export default EditCustomization;