// FooterSection.tsx
import { styles } from '@/app/(tabs)/home/HomeScreenStyle';
import React from 'react';
import { View, Text, Image } from 'react-native';

export default function FooterSection() {
    return (
        <View style={styles.footerContainer}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>
                    Only <Text style={styles.greenText}>all-in-one marketplace</Text>
                </Text>
                <Text style={styles.headerSubtitle}>
                    with <Text style={styles.greenText}>zero platform fees!</Text>
                </Text>
            </View>

            {/* Main Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require("../../assets/tabs/footer.webp")}
                    style={styles.mainImage}
                    resizeMode="cover"
                />
            </View>

            {/* Feature Cards */}
            <View style={styles.cardsContainer}>
                <View style={styles.cardRow}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Zero Platform{"\n"}
                            <Text style={styles.greenText}>Fees</Text>
                        </Text>
                        <Text style={styles.cardDescription}>
                            Enjoy shopping without any additional fees.
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Text style={styles.greenText}>6 Categories</Text>
                        </Text>
                        <Text style={styles.cardDescription}>
                            Currently offering grocery, food, interior, electronics,
                            personal care, and home decor.
                        </Text>
                    </View>
                </View>

                <View style={styles.cardRow}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Text style={styles.greenText}>5 Lakh+ Sellers</Text>
                        </Text>
                        <Text style={styles.cardDescription}>
                            Items curated from over 5 lakh sellers across India.
                        </Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Monetize Your{"\n"}
                            <Text style={styles.greenText}>Experience</Text>
                        </Text>
                        <Text style={styles.cardDescription}>
                            Turn your shopping into rewarding experiences.
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
