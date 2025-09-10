import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back-outline" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Privacy Policy | MartPe</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.paragraph}>
            This policy applies to Pnorm Private Limited, a company incorporated under the Companies Act, 2013 with its registered office at Aster 4A, Klassik Landmark, Kasavanahalli Road, Carmelaram, Bangalore South, Bangalore-560035, Karnataka, India and its customer facing E-commerce marketplace application branded as MartPe.
          </Text>

          <Text style={styles.paragraph}>
            This policy describes how MartPe collects, stores, uses and otherwise processes your Personal Information through MartPe websites, MartPe Applications, m-sites, chatbots, notifications or any other medium used by MartPe to provide its services to you (hereinafter referred to as the "Platform"). By visiting, downloading, using MartPe Platform, and/or, providing your information or availing our product/services, you expressly agree to be bound by this Privacy Policy ("Policy") and the applicable service/product terms and conditions. We value the trust you place in us and respect your privacy, maintaining the highest standards for secure transactions and protection of your personal information.
          </Text>

          <Text style={styles.sectionHeading}>Information Collection</Text>
          <Text style={styles.paragraph}>
            The information as detailed below is collected for us to be able to provide the services chosen by you and also to fulfill our legal obligations as well as our obligations towards third parties as per our User Agreement.
          </Text>

          <Text style={styles.paragraph}>
            "Personal Information" of User shall include the information shared by the User and collected by us for the following purposes:
          </Text>

          <Text style={styles.paragraph}>
            Information which you provide while subscribing to or registering on the Website, including but not limited to information about your personal identity such as name, gender, age etc., your contact details such as your email address, postal addresses, telephone (mobile or otherwise) and/or fax numbers. The information may also include information such as your banking details (including credit/debit card) and any other information relating to your income and/or lifestyle; billing information, payment history etc. (as shared by you).
          </Text>

          <Text style={styles.sectionHeading}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            The Personal Information collected maybe used in the following manner:
          </Text>

          <Text style={styles.paragraph}>
            While making a purchase, we may use Personal Information including, payment details which include cardholder name, credit/debit card number (in encrypted form) with expiration date, banking details, wallet details etc. as shared and allowed to be stored by you. We may also use the information of the purchaser list as available in or linked with your account. This information is presented to the User at the time of making a transaction to enable you to complete your transactions expeditiously.
          </Text>

          <Text style={styles.sectionHeading}>Surveys and Feedback</Text>
          <Text style={styles.paragraph}>
            We value opinions and comments from our Users and frequently conduct surveys, both online and offline. Participation in these surveys is entirely optional. Typically, the information received is aggregated, and used to make improvements to Website, other Sales Channels, services and to develop appealing content, features and promotions for members based on the results of the surveys. Identity of the survey participants is anonymous unless otherwise stated in the survey.
          </Text>

          <Text style={styles.paragraph}>
            MartPe provides an option to its users to post their experiences by way of review, ratings and general poll questions. The customers also have an option of posting questions w.r.t a service offered by MartPe or post answers to questions raised by other users. MartPe may also hire a third party to contact you and gather feedback about your recent purchase order with MartPe. Though participation in the feedback process is purely optional, you may still receive emails, notifications (SMS, Whatsapp or any other messaging service) for you to share your feedback. The reviews may be written or in a video format. The reviews written or posted may also be visible on other E-commerce platforms.
          </Text>

          <Text style={styles.sectionHeading}>Marketing and Promotions</Text>
          <Text style={styles.paragraph}>
            Marketing promotions, research and programs help us to identify your preferences, develop programs and improve user experience. MartPe frequently sponsors promotions to give its Users the opportunity to win great prizes. Personal Information collected by us for such activities may include contact information and survey questions. We use such Personal Information to notify contest winners and survey information to develop promotions and product improvements. As a registered User, you will also occasionally receive updates from us about offers and sales in your area, special offers, new MartPe services, other noteworthy items (like savings and benefits on purchases and marketing programs). In addition, you may look forward to receiving periodic marketing emails, newsletters and exclusive promotions offering special deals.
          </Text>

          <Text style={styles.sectionHeading}>Data Retention</Text>
          <Text style={styles.paragraph}>
            MartPe will retain your Personal Information on its servers for as long as is reasonably necessary for the purposes listed in this policy. In some circumstances we may retain your Personal Information for longer periods of time, for instance where we are required to do so in accordance with any legal, regulatory, tax or accounting requirements.
          </Text>

          <Text style={styles.sectionHeading}>Cookies and Tracking</Text>
          <Text style={styles.paragraph}>
            MartPe uses cookies to personalize your experience on the Website and the advertisements that may be displayed. MartPe use of cookies is similar to that of any other reputable online companies.
          </Text>

          <Text style={styles.paragraph}>
            Cookies are small pieces of information that are stored by your browser on your device's hard drive. Cookies allow us to serve you better and more efficiently. Cookies also allow ease of access, by logging you in without having to type your login name each time (only your password is needed); we may also use such cookies to display any advertisement(s) to you while you are on the Website or to send you offers (or similar emails ‐ provided you have not opted out of receiving such emails) focusing on destinations which may be of your interest.
          </Text>

          <Text style={styles.sectionHeading}>App Permissions</Text>
          <Text style={styles.paragraph}>
            When the MartPe app is installed on your phone or tablet, a list of permissions appear and are needed for the app to function effectively. There is no option to customize the list. The permissions that MartPe requires and the data that shall be accessed and its use is as below:
          </Text>

          <Text style={styles.subHeading}>Device Information</Text>
          <Text style={styles.paragraph}>
            We need your device permission to get information about your device, like OS (operating system) name, OS version, mobile network, hardware model, unique device identifier, preferred language, etc. Based on these inputs, we intend to optimize your shopping/purchase experience.
          </Text>

          <Text style={styles.subHeading}>Location Access</Text>
          <Text style={styles.paragraph}>
            This permission enables us to give you the benefit of location specific deals and provide you a personalized experience. When you launch the MartPe app to make a purchase, we auto-detect your location so that your nearest city is auto-filled. We also require this permission to be able to help you track your order/purchase with respect to your location.
          </Text>

          <Text style={styles.subHeading}>SMS Access</Text>
          <Text style={styles.paragraph}>
            If you allow us to access your SMS, we read your SMS to autofill or pre-populate 'OTP' while making a transaction and to validate your mobile number. This provides you a seamless purchase experience while making a transaction and you don't need to move out of the app to read the SMS and then enter it in the app.
          </Text>

          <Text style={styles.subHeading}>Phone Calls</Text>
          <Text style={styles.paragraph}>
            The app requires access to make phone calls so that you can make phone calls to delivery partners and our customer contact centers directly through the app.
          </Text>

          <Text style={styles.subHeading}>Contacts</Text>
          <Text style={styles.paragraph}>
            If you allow us to access your contacts, it enables us to provide a lot of social features to you such as sharing your purchase or location with your friends. This permission also allows you to select numbers from your contacts for mobile recharges done on the app.
          </Text>

          <Text style={styles.subHeading}>Camera and Storage</Text>
          <Text style={styles.paragraph}>
            This permission is used to capture pictures of the items purchased in case of item return or refund. These images can then be uploaded as part of multimedia reviews.
          </Text>

          <Text style={styles.subHeading}>Calendar</Text>
          <Text style={styles.paragraph}>
            This permission enables us to put your shopping plans on your calendar.
          </Text>

          <Text style={styles.subHeading}>Notifications</Text>
          <Text style={styles.paragraph}>
            If you opt in for notifications, it enables us to send across exclusive deals, promotional offers, order related updates, etc. on your device. If you do not opt for this, updates for your order like order confirmation, refund (in case of cancellation), etc. will be sent through SMS.
          </Text>

          <Text style={styles.sectionHeading}>Data Security</Text>
          <Text style={styles.paragraph}>
            All payments on the Website are secured. This means all Personal Information you provide is transmitted using TLS (Transport Layer Security) encryption. TLS is a proven coding system that lets your browser automatically encrypt, or scramble, data before you send it to us. Website has stringent security measures in place to protect the loss, misuse, and alteration of the information under our control. Whenever you change or access your account information, we offer the use of a secure server. Once your information is in our possession we adhere to strict security guidelines, protecting it against unauthorized access.
          </Text>

          <Text style={styles.sectionHeading}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You may withdraw your consent to submit any or all Personal Information or decline to provide any permissions on its Website as covered above at any time. In case, you choose to do so then your access to the Website may be limited, or we might not be able to provide the services to you. You may withdraw your consent by sending an email to support@martpe.in
          </Text>

          <Text style={styles.paragraph}>
            You may access your Personal Information from your user account with MartPe. You may also correct your personal information or delete such information (except some mandatory fields) from your user account directly. If you don't have such a user account, then you write to support@martpe.in
          </Text>

          <Text style={styles.sectionHeading}>Age Requirement</Text>
          <Text style={styles.paragraph}>
            You must be at least 18 years of age to transact directly with MartPe and also to consent to the processing of your personal data.
          </Text>

          <Text style={styles.sectionHeading}>Contact Us</Text>
          <Text style={styles.paragraph}>
            You may always submit concerns regarding this Privacy Policy via email to us at support@martpe.in. MartPe shall endeavor to respond to all reasonable concerns and inquiries.
          </Text>

          <Text style={styles.paragraph}>
            In case you want to delete your account or your personal information, you may write to us at support@martpe.in, requesting for deletion of your account. Please note that the DPO may require you to verify your identity before proceeding with your request of deleting your account. Any identity proof that you may provide shall be stored for a period of 21 days from the date of deletion of the account.
          </Text>

          <Text style={styles.paragraph}>
            We reserve the right to revise the Privacy Policy from time to time to suit various legal, business and customer requirements. We will duly notify the users as may be necessary.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  placeholder: {
    width: 40, // Same width as backButton to center the title
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginTop: 24,
    marginBottom: 12,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'justify',
  },
});
