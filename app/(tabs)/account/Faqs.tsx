import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,
} from 'react-native';
import {  Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface FAQItem {
  question: string;
  answer: string;
}

const Faqs: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // First item expanded by default

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@martpe.in");
  };

  const faqData: FAQItem[] = [
    {
      question: "How does Martpe work?",
      answer: "Martpe is an e-commerce app that connects buyers with local sellers and logistic partners. It offers a wide selection of products, including national brands and local groceries, apparel, footwear, and accessories."
    },
    {
      question: "What are Martpe's terms and conditions?",
      answer: "Martpe does not provide pick-up and delivery services, but instead facilitates delivery by connecting buyers with logistic partners." 
    },
    {
      question: "How do I contact Martpe support?",
      answer: "can also reach out to us at support@martpe.in for any queries or go to the Contact Us section in the app."
    },
    {
      question: "How can I log in to the Martpe application or website?",
      answer: "You can log in to the Martpe app or website using your registered phone number and entering the OTP received via SMS or WhatsApp. If you're a first-time user, you need to register your phone number and verify it with the OTP."
    },
    {
      question: "What if I do not receive the OTP?",
      answer: "You can request a new OTP by pressing the (Resend) button."
    },
    {
      question: "Where is my order?",
      answer: "Once your order is successfully placed, you can check your orders in the (My Order) section under the (Account) section of the home page. If you need more information, contact the delivery partner or the store directly." 
    },
    {
      question: "What if an item is missing from my order?",
      answer: "You can reach out to the delivery partner or the store directly."
    },
    {
      question: "Can I place a single order from multiple stores?",
      answer: "No, this is not allowed. However, you can order items from separate stores through separate orders."
    },
    {
      question: "What if my money is debited but the order is not placed?",
      answer: "If your money is deducted but the order was not placed, the amount will automatically be refunded to your source account within 7 days. The refund does not include any cashback or discounts applied during the order. If you do not receive the refund within 7 days, please contact us at support@martpe.in." 
     },
    {
      question: "Can I choose to pay for my order using Cash on Delivery?",
      answer: "No, Martpe does not accept Cash on Delivery. You can make payments using UPI, credit card, debit card, or internet banking."
    },
  ];

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderAnswerWithEmail = (answer: string) => {
    if (answer.includes('support@martpe.in')) {
      const parts = answer.split('support@martpe.in');
      return (
        <Text style={styles.answerText}>
          {parts[0]}
          <Text style={styles.emailLink} onPress={handleEmailPress}>
            support@martpe.in
          </Text>
          {parts[1]}
        </Text>
      );
    }
    return <Text style={styles.answerText}>{answer}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
        <Ionicons name="arrow-back-outline" size={20} color="black" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Frequently Asked Questions</Text>
          </View>   
        </View>     
        
        <View style={styles.faqContainer}>
          {faqData.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleExpanded(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.questionText}>{item.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={24}
                  color="#666"
                  style={styles.chevronIcon}
                />
              </TouchableOpacity>
              
              {expandedIndex === index && item.answer && (
                <View style={styles.answerContainer}>
                  {renderAnswerWithEmail(item.answer)}
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginLeft: 28,
  },
  backButton: {
    padding: 4,
    marginLeft: -14,
  },
  faqContainer: {
    paddingBottom: 20,
  },
  faqItem: {
    backgroundColor: '#fff',
    marginBottom: 1,
    borderRadius: 0,
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  questionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
    marginRight: 15,
    lineHeight: 22,
  },
  chevronIcon: {
    marginLeft: 10,
  },
  answerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  answerText: {
    fontSize: 13,
    color: '#222',
    lineHeight: 20,
  },
  emailLink: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});

export default Faqs;
