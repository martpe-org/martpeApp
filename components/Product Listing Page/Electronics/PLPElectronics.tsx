import React, { useState, useMemo } from "react";
import { View } from "react-native";
import HorizontalNavbar from "../Grocery/HorizontalNavbar";
import GroceryCardContainer, { CatalogItem, NoItemsDisplay } from "../Grocery/GroceryCardContainer";

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

  // Use sidebarTitles if provided, otherwise use predefined buttons
  const getNavbarButtons = () => {
    // Default electronics categories with their specific images
    const defaultButtons = [
      {
        title: "All",
        image: require("../../../assets/electronicsHeaderImage1.png"),
      },
      {
        title: "Audio",
        image: require("../../../assets/electronicsHeaderImage1.png"),
      },
      {
        title: "Camera",
        image: require("../../../assets/electronicsHeaderImage2.png"),
      },
      {
        title: "Computer Peripherals",
        image: require("../../../assets/electronicsHeaderImage3.png"),
      },
      {
        title: "Desktop & Laptop",
        image: require("../../../assets/electronicsHeaderImage4.png"),
      },
      {
        title: "Earphone",
        image: require("../../../assets/electronicsHeaderImage5.png"),
      },
      {
        title: "Gaming",
        image: require("../../../assets/electronicsHeaderImage6.png"),
      },
      {
        title: "Headphone",
        image: require("../../../assets/electronicsHeaderImage7.png"),
      },
      {
        title: "Mobile Phone",
        image: require("../../../assets/electronicsHeaderImage8.png"),
      },
      {
        title: "Accessories",
        image: require("../../../assets/electronicsHeaderImage9.png"),
      },
      {
        title: "Smart Watches",
        image: require("../../../assets/electronicsHeaderImage10.png"),
      },
    ];

    if (sidebarTitles && sidebarTitles.length > 0) {
      // Map sidebarTitles to their corresponding images or create fallback images
      const mappedButtons = sidebarTitles.map((title, index) => {
        // Find matching button from defaultButtons
        const matchingButton = defaultButtons.find(
          (btn) => btn.title === title
        );
        
        if (matchingButton) {
          return matchingButton;
        }
        
        // Create fallback with placeholder image URL or use a default asset
        const fallbackImageIndex = (index % 10) + 1; // Cycle through available images
        const fallbackImage = defaultButtons[fallbackImageIndex]?.image || defaultButtons[0].image;
        
        return { 
          title, 
          image: fallbackImage,
          // Alternative: use a web-based placeholder
          imageUrl: `https://via.placeholder.com/55x55/007ACC/FFFFFF?text=${encodeURIComponent(title.charAt(0))}`
        };
      });

      // Add "All" to the beginning if not present
      const hasAll = mappedButtons.some((btn) => btn.title === "All");
      if (!hasAll) {
        return [defaultButtons[0], ...mappedButtons]; // Add "All" button first
      }
      return mappedButtons;
    }

    // Return all default buttons
    return defaultButtons;
  };

  const navbarButtons = getNavbarButtons();

  // Function to filter catalog based on selected category
  const getFilteredCatalog = (): CatalogItem[] => {
    if (activeCategory === "All") {
      return catalog;
    }

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
            itemName.includes("dslr") ||
            itemDesc.includes("camera")
          );

        case "Computer Peripherals":
          return (
            itemName.includes("keyboard") ||
            itemName.includes("mouse") ||
            itemName.includes("monitor") ||
            itemName.includes("webcam") ||
            itemDesc.includes("peripheral")
          );

        case "Desktop & Laptop":
          return (
            itemName.includes("laptop") ||
            itemName.includes("desktop") ||
            itemName.includes("computer") ||
            itemDesc.includes("laptop") ||
            itemDesc.includes("desktop")
          );

        case "Earphone":
          return (
            itemName.includes("earphone") ||
            itemName.includes("earbud") ||
            itemDesc.includes("earphone")
          );

        case "Gaming":
          return (
            itemName.includes("gaming") ||
            itemName.includes("console") ||
            itemName.includes("controller") ||
            itemDesc.includes("gaming")
          );

        case "Headphone":
          return (
            itemName.includes("headphone") ||
            itemName.includes("headset") ||
            itemDesc.includes("headphone")
          );

        case "Mobile Phone":
          return (
            itemName.includes("mobile") ||
            itemName.includes("phone") ||
            itemName.includes("smartphone") ||
            itemDesc.includes("mobile") ||
            itemDesc.includes("phone")
          );

        case "Accessories":
          return (
            itemName.includes("accessory") ||
            itemName.includes("case") ||
            itemName.includes("cover") ||
            itemName.includes("charger") ||
            itemDesc.includes("accessory")
          );

        case "Smart Watches":
          return (
            itemName.includes("watch") ||
            itemName.includes("smartwatch") ||
            itemName.includes("wearable") ||
            itemDesc.includes("watch")
          );

        default:
          return true;
      }
    });
  };
  
  const filteredCatalog = getFilteredCatalog();

  // Transform catalog items to ensure they have the image field that GroceryCard expects
  const transformCatalogForDisplay = useMemo(() => {
    const transformItems = (items: CatalogItem[]) => {
      return items.map(item => ({
        ...item,
        // Ensure symbol field exists for GroceryCard
        symbol: item.symbol || 
                item.descriptor?.images?.[0] || 
                item.descriptor?.symbol ||
                "https://via.placeholder.com/150?text=Electronics"
      }));
    };
    return transformItems;
  }, []);

  const transformedFilteredCatalog = useMemo(() => 
    transformCatalogForDisplay(filteredCatalog), 
    [filteredCatalog, transformCatalogForDisplay]
  );

  const transformedFullCatalog = useMemo(() => 
    transformCatalogForDisplay(catalog), 
    [catalog, transformCatalogForDisplay]
  );

  const handleCategorySelect = (title: string) => {
    setActiveCategory(title);
    console.log("Selected Category:", title);
  };

  return (
    <View style={{ flex: 1 }}>
      <HorizontalNavbar
        navbarTitles={navbarButtons}
        domainColor="#007ACC" // Electronics theme color
        onFilterSelect={handleCategorySelect}
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