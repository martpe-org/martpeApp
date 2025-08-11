import { FC } from "react";
import { View } from "react-native";
import FashionCategories from "./FashionCategories";
import PLPCardContainer from "./PLPCardContainer";

interface PLPFashionProps {
  catalog: any[];
    headers: string[];

}

const PLPFashion: FC<PLPFashionProps> = ({ catalog ,headers}) => {
  return (
    <View style={{ backgroundColor: "#fff" }}>
      {/* FashionCategories already has its own data & state */}
      <FashionCategories />
      <PLPCardContainer
        domainColor="rgba(163, 251, 251, 1)"
        catalog={catalog}
      />
    </View>
  );
};

export default PLPFashion;
