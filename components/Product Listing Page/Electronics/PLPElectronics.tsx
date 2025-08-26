import React, { useState, useMemo } from "react";
import { View } from "react-native";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import GroceryCardContainer, {
  CatalogItem,
  NoItemsDisplay,
} from "../Grocery/GroceryCardContainer";

interface PLPElectronicsProps {
  catalog: CatalogItem[];
  sidebarTitles?: string[];
  providerId: string;
  searchString: string;
  handleOpenModal?: (item: CatalogItem) => void;
}

const PLPElectronics: React.FC<PLPElectronicsProps> = ({
  catalog,
  sidebarTitles,
  providerId,
  searchString,
  handleOpenModal = () => {},
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Default electronics categories
  const defaultButtons = [
    { title: "All", image: require("../../../assets/electronicsHeaderImage1.png") },
    { title: "Audio", image: require("../../../assets/electronicsHeaderImage1.png") },
    { title: "Camera", image: require("../../../assets/electronicsHeaderImage2.png") },
    { title: "Computer Peripherals", image: require("../../../assets/electronicsHeaderImage3.png") },
    { title: "Desktop & Laptop", image: require("../../../assets/electronicsHeaderImage4.png") },
    { title: "Earphone", image: require("../../../assets/electronicsHeaderImage5.png") },
    { title: "Gaming", image: require("../../../assets/electronicsHeaderImage6.png") },
    { title: "Headphone", image: require("../../../assets/electronicsHeaderImage7.png") },
    { title: "Mobile Phone", image: require("../../../assets/electronicsHeaderImage8.png") },
    { title: "Accessories", image: require("../../../assets/electronicsHeaderImage9.png") },
    { title: "Smart Watches", image: require("../../../assets/electronicsHeaderImage10.png") },
  ];

  // ✅ Sidebar mapping
  const navbarButtons = useMemo(() => {
    if (sidebarTitles && sidebarTitles.length > 0) {
      const mapped = sidebarTitles.map((title, index) => {
        const match = defaultButtons.find((btn) => btn.title === title);
        if (match) return match;

        const fallbackIndex = (index % 10) + 1;
        const fallbackImage =
          defaultButtons[fallbackIndex]?.image || defaultButtons[0].image;

        return { title, image: fallbackImage };
      });

      if (!mapped.some((b) => b.title === "All")) {
        return [defaultButtons[0], ...mapped];
      }
      return mapped;
    }
    return defaultButtons;
  }, [sidebarTitles]);

  // ✅ Filter catalog by category (uses name/desc fallback)
  const filteredCatalog = useMemo(() => {
    if (activeCategory === "All") return catalog;

    return catalog.filter((item) => {
      const itemName = item?.descriptor?.name?.toLowerCase() || "";
      const itemDesc = item?.descriptor?.long_desc?.toLowerCase() || "";

      switch (activeCategory) {
        case "Audio":
          return (
            itemName.includes("audio") ||
            itemName.includes("speaker") ||
            itemName.includes("soundbar") ||
            itemDesc.includes("audio")
          );
        case "Camera":
          return (
            itemName.includes("camera") ||
            itemName.includes("lens") ||
            itemDesc.includes("camera")
          );
        case "Computer Peripherals":
          return (
            itemName.includes("keyboard") ||
            itemName.includes("mouse") ||
            itemName.includes("monitor") ||
            itemDesc.includes("peripheral")
          );
        case "Desktop & Laptop":
          return (
            itemName.includes("laptop") ||
            itemName.includes("desktop") ||
            itemName.includes("computer")
          );
        case "Earphone":
          return itemName.includes("earphone") || itemName.includes("earbud");
        case "Gaming":
          return (
            itemName.includes("gaming") ||
            itemName.includes("console") ||
            itemName.includes("controller")
          );
        case "Headphone":
          return itemName.includes("headphone") || itemName.includes("headset");
        case "Mobile Phone":
          return (
            itemName.includes("mobile") ||
            itemName.includes("phone") ||
            itemName.includes("smartphone")
          );
        case "Accessories":
          return (
            itemName.includes("accessory") ||
            itemName.includes("case") ||
            itemName.includes("cover") ||
            itemName.includes("charger")
          );
        case "Smart Watches":
          return itemName.includes("watch") || itemName.includes("smartwatch");
        default:
          return true;
      }
    });
  }, [catalog, activeCategory]);

  // ✅ Transform items for GroceryCard (keep image & symbol separate)
  const transformItems = (items: CatalogItem[]) =>
    items.map((item) => ({
      ...item,
      image:
        item.descriptor?.images?.[0] ||
        "https://via.placeholder.com/150?text=Electronics",
      symbol: item.symbol || item.descriptor?.symbol || "",
      slug: item.slug || item.id, // ✅ ensure slug is always available
    }));

  const transformedFilteredCatalog = useMemo(
    () => transformItems(filteredCatalog),
    [filteredCatalog]
  );

  const transformedFullCatalog = useMemo(
    () => transformItems(catalog),
    [catalog]
  );

  return (
    <View style={{ flex: 1 }}>
      <HorizontalNavbar
        navbarTitles={navbarButtons}
        domainColor="#007ACC"
        onFilterSelect={setActiveCategory}
        activeCategory={activeCategory}
        hasProducts={filteredCatalog.length > 0}
      />

      {filteredCatalog.length > 0 ? (
        <GroceryCardContainer
          providerId={providerId}
          searchString={searchString}
          catalog={transformedFilteredCatalog}
          selectedCategory={activeCategory}
          handleOpenModal={handleOpenModal}
        />
      ) : activeCategory !== "All" ? (
        <NoItemsDisplay category={activeCategory} />
      ) : (
        <GroceryCardContainer
          providerId={providerId}
          searchString={searchString}
          catalog={transformedFullCatalog}
          selectedCategory={activeCategory}
          handleOpenModal={handleOpenModal}
        />
      )}
    </View>
  );
};

export default PLPElectronics;
