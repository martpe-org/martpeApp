// components/Product/ProductBottomDetail.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { FetchProductDetail } from "../product/fetch-product-type";
import { prettifyTemporalDuration } from "@/utility/CheckoutUtils";

interface ProductBottomDetailProps {
  product: FetchProductDetail;
}

const ProductBottomDetail: React.FC<ProductBottomDetailProps> = ({ product }) => {
  const getSafe = (val: any) =>
    val === undefined || val === null ? "" : String(val);

  const rows: Array<{ label: string; value: string }> = [];

  // Type guard to safely access meta properties
  const meta = (product?.meta || {}) as any;

  if (meta.fssai_license_no) {
    rows.push({ label: "FSSAI License No", value: getSafe(meta.fssai_license_no) });
  }

  if (meta.mandatory_reqs_veggies_fruits?.net_quantity) {
    rows.push({
      label: "Net Quantity",
      value: getSafe(meta.mandatory_reqs_veggies_fruits?.net_quantity),
    });
  }

  if (meta.statutory_reqs_packaged_commodities?.common_or_generic_name_of_commodity) {
    rows.push({
      label: "Common or Generic Name of Commodity",
      value: getSafe(
        meta.statutory_reqs_packaged_commodities?.common_or_generic_name_of_commodity
      ),
    });
  }

  if (meta.statutory_reqs_packaged_commodities?.manufacturer_or_packer_address) {
    rows.push({
      label: "Manufacturer or Packer Address",
      value: getSafe(
        meta.statutory_reqs_packaged_commodities?.manufacturer_or_packer_address
      ),
    });
  }

  if (meta.statutory_reqs_packaged_commodities?.manufacturer_or_packer_name) {
    rows.push({
      label: "Manufacturer or Packer Name",
      value: getSafe(
        meta.statutory_reqs_packaged_commodities?.manufacturer_or_packer_name
      ),
    });
  }

  if (meta.statutory_reqs_packaged_commodities?.month_year_of_manufacture_packing_import) {
    rows.push({
      label: "Date of Manufacture/Packing/Import",
      value: getSafe(
        meta.statutory_reqs_packaged_commodities?.month_year_of_manufacture_packing_import
      ),
    });
  }

  if (meta.statutory_reqs_packaged_commodities?.net_quantity_or_measure_of_commodity_in_pkg) {
    rows.push({
      label: "Net Quantity in Package",
      value: getSafe(
        meta.statutory_reqs_packaged_commodities?.net_quantity_or_measure_of_commodity_in_pkg
      ),
    });
  }

  if (meta.statutory_reqs_prepackaged_food?.additives_info) {
    rows.push({
      label: "Additives Info",
      value: getSafe(meta.statutory_reqs_prepackaged_food?.additives_info),
    });
  }

  if (meta.statutory_reqs_prepackaged_food?.brand_owner_FSSAI_license_no) {
    rows.push({
      label: "Brand Owner FSSAI License No",
      value: getSafe(meta.statutory_reqs_prepackaged_food?.brand_owner_FSSAI_license_no),
    });
  }

  if (meta.statutory_reqs_prepackaged_food?.importer_FSSAI_license_no) {
    rows.push({
      label: "Importer FSSAI License No",
      value: getSafe(meta.statutory_reqs_prepackaged_food?.importer_FSSAI_license_no),
    });
  }

  if (meta.statutory_reqs_prepackaged_food?.nutritional_info) {
    rows.push({
      label: "Nutritional Info",
      value: getSafe(meta.statutory_reqs_prepackaged_food?.nutritional_info),
    });
  }

  if (meta.statutory_reqs_prepackaged_food?.other_FSSAI_license_no) {
    rows.push({
      label: "Other FSSAI License No",
      value: getSafe(meta.statutory_reqs_prepackaged_food?.other_FSSAI_license_no),
    });
  }

  if (meta.contact_details_consumer_care) {
    rows.push({
      label: "Consumer Care Contact Details",
      value: getSafe(meta.contact_details_consumer_care),
    });
  }

  if (meta.returnable && meta.return_window) {
    rows.push({
      label: "Return Window",
      value: prettifyTemporalDuration(meta.return_window),
    });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.wrapper}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.detailsHeader}>
        <Text style={styles.detailsHeading}>Product Details</Text>
      </View>

      <View style={styles.table}>
        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No additional details available</Text>
          </View>
        ) : (
          rows.map((r, idx) => (
            <View
              key={`${r.label}-${idx}`}
              style={[
                styles.tableRow,
                idx % 2 === 0 ? styles.rowLight : styles.rowDark,
              ]}
            >
              <View style={styles.leftCell}>
                <Text style={styles.cellLabel}>{r.label}</Text>
              </View>
              <View style={styles.rightCell}>
                <Text style={styles.cellValue}>{r.value}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default ProductBottomDetail;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 36,
    backgroundColor: "#fff",
  },
  detailsHeader: {
    margin: 6,
  },
  detailsHeading: {
    fontSize: 18,
    fontWeight: "500",
    color: "#111",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  rowLight: {
    backgroundColor: "#fff",
  },
  rowDark: {
    backgroundColor: "#fbfbfb",
  },
  leftCell: {
    flex: 1,
  },
  rightCell: {
    flex: 1,
    alignItems: "flex-end",
  },
  cellLabel: {
    fontSize: 14,
    color: "#333",
  },
  cellValue: {
    fontSize: 14,
    color: "#111",
    textAlign: "right",
  },
  emptyRow: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#666",
  },
});