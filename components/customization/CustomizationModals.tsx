import React from "react";
import CustomizationGroup from "../customization/CustomizationGroup";
import EditCustomization from "../customization/EditCustomization";

interface Props {
  customizationModal: boolean;
  editCustomizationModal: boolean;
  cartItem: any;
  storeId?: string;
  catalogId?: string;
  productPrice?: number;
  productName?: string;
  customGroupIds: string[];
  count: number;
  onCloseCustomization: () => void;
  onCustomizationSuccess: (customizations: any[]) => void;
  onCloseEdit: () => void;
  onEditSuccess: () => void;
}

const CustomizationModals: React.FC<Props> = ({
  customizationModal,
  editCustomizationModal,
  cartItem,
  storeId,
  catalogId,
  productPrice,
  productName,
  customGroupIds,
  count,
  onCloseCustomization,
  onCustomizationSuccess,
  onCloseEdit,
  onEditSuccess,
}) => {
  return (
    <>
      {customizationModal && (
        <CustomizationGroup
          productSlug={cartItem?.slug || ""}
          storeId={storeId || ""}
          catalogId={catalogId || ""}
          productPrice={cartItem?.product?.price || productPrice || 0}
          directlyLinkedCustomGroupIds={customGroupIds}
          visible={customizationModal}
          onClose={onCloseCustomization}
          onAddSuccess={onCustomizationSuccess}
          productName={productName}
        />
      )}

      {editCustomizationModal && cartItem && (
        <EditCustomization
          cartItemId={cartItem.id}
          productSlug={cartItem.slug}
          storeId={storeId || cartItem.store_id}
          catalogId={catalogId || ""}
          productPrice={cartItem.product?.price || productPrice || cartItem.unit_price}
          currentQty={count}
          directlyLinkedCustomGroupIds={customGroupIds}
          visible={editCustomizationModal}
          onClose={onCloseEdit}
          onUpdateSuccess={onEditSuccess}
          productName={productName || cartItem.product?.name}
          existingCustomizations={cartItem.selected_customizations || []}
        />
      )}
    </>
  );
};

export default CustomizationModals;
