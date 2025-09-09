import React from 'react';
import { 
  View, 
  Text, 
  Linking, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ContactUs: React.FC = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:support@martpe.in');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+917358301523');
  };
    const handleLocationPress = () => {
    const address = 'PNORM TECHNOLOGY PRIVATE LIMITED, Aster 4A, Klassik Landmark, Kasavanahalli Road, Carmelram, Bangalore South, Karnataka, 560035';
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(address)}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>Contact Us</Text>
        
        <Text style={styles.description}>
          We would love to hear from you! For any queries, feel free to write to us at:
        </Text>
        
        <TouchableOpacity onPress={handleEmailPress} style={styles.emailContainer}>
          <Text style={styles.emailLink}>support@martpe.in</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Our Office</Text>
        
        <View style={styles.officeInfo}>
          <View style={styles.officeHeader}>
            <TouchableOpacity style={styles.officeDetails}
              onPress={handleLocationPress}
            activeOpacity={0.7}
            >
              <Text style={styles.companyName}>PNORM TECHNOLOGY PRIVATE LIMITED</Text>
                          <Ionicons name="location" size={20} color="#e4522e" style={styles.locationIcon} />

              <Text style={styles.addressText}>Aster 4A, Klassik Landmark,</Text>
              <Text style={styles.addressText}>Kasavanahalli Road,</Text>
              <Text style={styles.addressText}>Carmelram, Bangalore South,</Text>
              <Text style={styles.addressText}>Karnataka, 560035</Text>
              <Text style={styles.addressText}>India</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity onPress={handlePhonePress} style={styles.phoneContainer}>
            <Ionicons name="call-outline" size={20} color="#0a0909" style={styles.phoneIcon} />
            <Text style={styles.phoneLink}>+91 7358301523</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  content: {
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  emailContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  emailLink: {
    fontSize: 18,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  officeInfo: {
    alignItems: 'center',
  },
  officeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    maxWidth: 400,
  },
  locationIcon: {
    marginTop: 2,
    alignSelf: 'center',
  },
  officeDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  phoneIcon: {
    marginRight: 8,
  },
  phoneLink: {
    fontSize: 16,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
});

export default ContactUs;
