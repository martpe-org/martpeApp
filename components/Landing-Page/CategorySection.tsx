// CategorySection.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '@/app/(tabs)/home/HomeScreenStyle';

interface CategoryItem {
  id: number;
  name: string;
  image: string; // Changed from 'any' to 'string' since it's a URI
}

interface CategorySectionProps {
  title: string;
  data: CategoryItem[];
  containerStyle?: 'personalCare' | 'homeDecor' | 'twoColumn';
}

export default function CategorySection({ title, data, containerStyle = 'twoColumn' }: CategorySectionProps) {
  const router = useRouter();

  const handleCategoryPress = (itemName: string) => {
    router.push({
      pathname: "/(tabs)/home/result/[search]" as any,
      params: {
        search: itemName,
      },
    });
  };

  const renderPersonalCare = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.personalCareContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.personalCareCard}
            onPress={() => handleCategoryPress(item.name)}
          >
            <View style={styles.personalCareImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.personalCareImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.personalCareTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderHomeDecor = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.homeDecorContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.homeDecorCard}
            onPress={() => handleCategoryPress(item.name)}
          >
            <View style={styles.homeDecorImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.homeDecorImage} 
                resizeMode="contain"
              />
            </View>
            <Text style={styles.homeDecorTitle}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderTwoColumn = () => (
    <View style={styles.twoColumnGrid}>
      {data.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.gridCard,
            index % 2 === 0 ? styles.gridCardLeft : styles.gridCardRight,
          ]}
          onPress={() => handleCategoryPress(item.name)}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.gridCardImage} 
            resizeMode="cover"
          />
          <Text style={styles.gridCardLabel}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (containerStyle) {
      case 'personalCare':
        return renderPersonalCare();
      case 'homeDecor':
        return renderHomeDecor();
      default:
        return renderTwoColumn();
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeaderWithLine}>
        <View style={styles.headerLine} />
        <Text style={styles.sectionTitleCentered}>{title}</Text>
        <View style={styles.headerLine} />
      </View>
      {renderContent()}
    </View>
  );
}
