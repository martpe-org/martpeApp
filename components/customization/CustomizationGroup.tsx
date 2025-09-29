import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { useToast } from 'react-native-toast-notifications';
import Loader from '../common/Loader';
import { fetchProductCustomizations } from './fetch-product-customizations';
import WrapperSheet from './WrapperSheet';

interface CustomizationGroupProps {
  productSlug: string;
  storeId: string;
  catalogId: string;
  productPrice: number;
  directlyLinkedCustomGroupIds?: string[];
  visible: boolean;
  onClose: () => void;
  onAddSuccess: (customizations: any[]) => void;
  productName?: string;
}

export type SelectedOptionsType = {
  [groupId: string]: {
    groupId: string;
    optionId: string;
    name: string;
  }[];
};

const CustomizationGroup: React.FC<CustomizationGroupProps> = ({
  productSlug,
  directlyLinkedCustomGroupIds = [],
  visible,
  onClose,
  onAddSuccess,
  productName,
}) => {
  const [customizationData, setCustomizationData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptionsType>({});
  const [history, setHistory] = useState<{ groups: string[]; selectedOptions: SelectedOptionsType; }[]>([
    { groups: directlyLinkedCustomGroupIds, selectedOptions: {} },
  ]);
  const [step, setStep] = useState(0);
  const [currentGroupIds, setCurrentGroupIds] = useState<string[]>(directlyLinkedCustomGroupIds || []);

  const toast = useToast();

  useEffect(() => {
    const fetchCustomizations = async () => {
      if (!visible || !productSlug) return;

      try {
        setLoading(true);
        const data = await fetchProductCustomizations(productSlug);

        if (data) {
          setCustomizationData(data);

          // Set default options
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
  }, [visible, productSlug]);

  const handleOptionChange = useCallback(
    (groupId: string, optionId: string, name: string) => {
      const currentGroup = customizationData?.[`cg_${groupId}`];
      if (!currentGroup) return;

      if (Number(currentGroup.config.max) > 1) {
        setSelectedOptions((prev) => ({
          ...prev,
          [groupId]: prev[groupId]
            ? prev[groupId].find((o) => o.optionId === optionId)
              ? prev[groupId].filter((o) => o.optionId !== optionId)
              : [...prev[groupId], { groupId, optionId, name }]
            : [{ groupId, optionId, name }],
        }));
      } else {
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

      setHistory((prev) => [...prev, { groups: newGroupIds, selectedOptions: { ...selectedOptions } }]);
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

  // ✅ Now only returns customizations, not adding item
  const handleAddToCart = () => {
    try {
      setAdding(true);
      const cartPayload = Object.entries(selectedOptions).flatMap(([groupId, options]) =>
        options.map((option) => ({
          groupId: `cg_${groupId}`,
          optionId: `ci_${option.optionId}`,
          name: option.name,
        }))
      );

      onAddSuccess(cartPayload);
      onClose();
    } catch (error) {
      console.error('Error preparing customizations:', error);
      toast.show('Error preparing customizations', { type: 'danger' });
    } finally {
      setAdding(false);
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

  const showAddButton = !hasChildGroups || (step !== 0 && step === history.length - 1);

  if (loading) return <Loader />;
  if (!customizationData) return <View />;

  return (
    <WrapperSheet
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
      onAddToCart={handleAddToCart}
      isNextDisabled={isNextDisabled}
      hasChildGroups={hasChildGroups}
      showAddButton={showAddButton}
      adding={adding}
    />
  );
};

export default CustomizationGroup;
