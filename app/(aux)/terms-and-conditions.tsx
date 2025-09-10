import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, Text, StyleSheet, View, TouchableOpacity, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsConditionsScreen() {
  const handlePrivacyPolicyPress = () => {
router.push("/privacy-policy");
  };

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
            <Text style={styles.title}>Terms & Conditions | MartPe</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

      <View style={styles.content}>
        <Text style={styles.sectionHeading}>Introduction</Text>
        <Text style={styles.paragraph}>
          These Terms and Conditions (the <Text style={styles.bold}>"T&C"</Text>) govern your use of our application, in relation to the Open Network for Digital Commerce, for mobile and handheld devices (<Text style={styles.bold}>"MartPe"</Text>) on the MartPe Shopping Solutions Private Limited platform (the "Platform"). For clarity, the Platform refers to any Platform owned/subscribed/used by MartPe Shopping Solutions Private Limited, not limited to websites, mobile applications, devices, URLs/links, notifications, chatbot, or any other communication medium used to provide services to Users.
        </Text>

        <Text style={styles.paragraph}>
          MartPe is owned and operated by MartPe Shopping Solutions Private Limited, a private limited company incorporated under the Companies Act, 2013 and having its registered office at Office-2, Floor 6, Wing B, Block A, Salarpuria Softzone, Bellandur Village, Varthur Hobli, Outer Ring Road, Bangalore South, Bangalore, Karnataka, India, 560103. For the purpose of these T&C, wherever the context so requires, <Text style={styles.bold}>"Buyer(s)", "you", "You", "your", "Your", "user", or "User", "End User"</Text> shall mean any natural or legal person who shall transact on MartPe by providing registration data while registering on MartPe as a registered user using any computer system, phone or handheld device. The terms <Text style={styles.bold}>"PSSPL", "We", "we", "Us", "us", "Our" or "our"</Text> shall mean MartPe Shopping Solutions Private Limited.
        </Text>

        <Text style={styles.sectionHeading}>Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          Users are requested to carefully read the T&C before using MartPe or registering on MartPe or accessing any material or information through MartPe. By clicking on the <Text style={styles.bold}>"Proceed"</Text> button, or through the continued use of MartPe, Users accept these T&C of Use and agree to be legally bound by the same. If You do not agree to these T&C, You may not use the services on MartPe, and We request You to uninstall MartPe. By installing, downloading or even merely using MartPe, You shall be contracting with PSSPL and You signify Your acceptance to this T&C and other PSSPL policies (including but not limited to the Cancellation & Refund Policy, Privacy Policy and Take Down Policy) as posted on MartPe and amended from time to time, which takes effect on the date on which You use MartPe, and thereby create a legally binding arrangement to abide by the same.
        </Text>

        <Text style={styles.sectionHeading}>MartPe Services</Text>
        <Text style={styles.paragraph}>
          PSSPL enables transactions on its MartPe application between Buyers and Sellers dealing in various categories of goods and services. (<Text style={styles.bold}>"MartPe Services"</Text>). You can choose and place orders (<Text style={styles.bold}>"Orders"</Text>) on MartPe, from a variety of goods and services (<Text style={styles.bold}>"Products"</Text>) listed and offered for sale by various Sellers including but not limited to the restaurants, kiranas, retail stores, electronic stores, supermarkets, grocery stores etc ("Seller(s)") through the Seller application (<Text style={styles.bold}>"Seller App"</Text>), which is a Platform on which the various Sellers are available. The goods and services are sold on a business to consumer basis only for personal consumption and not for resale.
        </Text>

        <Text style={styles.paragraph}>
          PSSPL may facilitate the delivery of such Orders or completion of tasks at select localities of serviceable cities across India (<Text style={styles.bold}>"Delivery Services"</Text>) provided by a Seller or by connecting third party service providers i.e. pick-up and delivery partners (<Text style={styles.bold}>"Logistic Partner"</Text>) who will be responsible for providing the pick-up and Delivery Services initiated by the users of MartPe (Buyers or Sellers). For both MartPe Services and Delivery Services, PSSPL is merely acting as an intermediary between the Sellers and Buyers and/or Logistic Partners and Buyers/Sellers.
        </Text>

        <Text style={styles.paragraph}>
          For the Delivery Services, PSSPL may charge the Buyer a delivery fee (inclusive of applicable taxes whenever not expressly mentioned) on behalf of the Logistic Partner/ Seller App/ party appointing the Logistic Partner, determined on the basis of various factors including but not limited to distance covered, time taken, demand for Delivery Services/tasks, real time analysis of traffic and weather conditions, seasonal peaks or such other parameters as may be determined from time to time.
        </Text>

        <Text style={styles.sectionHeading}>User Access and Conditions</Text>
        <Text style={styles.paragraph}>
          Use of and access to MartPe is offered to Users upon the condition of acceptance of all the terms, conditions and notices contained in these T&C and Privacy Policy, along with any amendments made by PSSPL at its sole discretion and posted on MartPe from time to time and subject to the above, PSSPL grants Users a personal, non-exclusive, non-transferable, limited privilege to enter and use MartPe and the PSSPL Services.
        </Text>

        <Text style={styles.paragraph}>
          By accessing MartPe, You represent that:-
        </Text>

        <Text style={styles.paragraph}>
          Without prejudice to the other legal remedies which PSSPL may avail, PSSPL and its entities shall reserve the right to terminate Your contract to use MartPe in case of any incorrect representation of the above-mentioned conditions.
        </Text>

        <Text style={styles.sectionHeading}>Modifications to Terms</Text>
        <Text style={styles.paragraph}>
          PSSPL retains the right to modify or amend these T&C. You can access the latest version of these T&C at any given time on MartPe. You should regularly review the T&C on MartPe. Your continued use of and access to MartPe shall be Your consent to such changes. In the event the modified T&C are not acceptable to You, You should discontinue accessing MartPe.
        </Text>

        <Text style={styles.sectionHeading}>Service Availability</Text>
        <Text style={styles.paragraph}>
          We will do Our utmost to ensure that availability of MartPe will be uninterrupted and that transmissions will be error-free. However, due to the nature of the internet and third party intervention/services being provided, this cannot be guaranteed. Also, Your access to MartPe may also be occasionally suspended or restricted for any reason whatsoever, including but not limited to repairs, maintenance, or the introduction of new facilities or services at any time without prior notice.
        </Text>

        <Text style={styles.sectionHeading}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          Please review our{" "}
          <Text style={styles.link} onPress={handlePrivacyPolicyPress}>
            Privacy Policy
          </Text>
          {" "} which governs Your visit to MartPe, to understand Our practices. The personal information / data provided to Us by You during the course of Your usage of MartPe will be treated as in accordance with the Privacy Policy and applicable laws and regulations. If You object to Your information being transferred or used, please do not use MartPe.
        </Text>

        <Text style={styles.sectionHeading}>Commercial Terms</Text>
        <Text style={styles.paragraph}>
          All commercial/contractual terms are offered by and agreed to between Buyers and Sellers or Seller App as the case maybe, alone with respect to Products being offered by the Sellers. The commercial/contractual terms include without limitation price, applicable taxes, shipping costs, payment terms, date, period and mode of delivery, warranties related to Product and after sales services related to Products. PSSPL does not have any control and does not determine or advise or in any way involve itself in the offering or acceptance of such commercial/contractual terms between the Buyers and Sellers. The price of the product and services offered by the Seller are determined by the Seller itself and PSSPL has no role to play in such determination of price in any way whatsoever.
        </Text>

        <Text style={styles.sectionHeading}>User Conduct and Restrictions</Text>
        <Text style={styles.paragraph}>
          You agree, undertake and confirm that Your use of MartPe shall be strictly governed by the following binding principles:
        </Text>

        <Text style={styles.subHeading}>Prohibited Content</Text>
        <Text style={styles.paragraph}>
          You shall not host, display, upload, modify, publish, transmit, update or share any information which:
        </Text>

        <Text style={styles.subHeading}>Unauthorized Access</Text>
        <Text style={styles.paragraph}>
          You shall not use any "deep-link", "page-scrape", "robot", "spider" or other automatic device, program, algorithm or methodology, or any similar or equivalent manual process, to access, acquire, copy or monitor any portion of MartPe or any Content, or in any way reproduce or circumvent the navigational structure or presentation of MartPe or any Content, to obtain or attempt to obtain any materials, documents or information through any means not purposely made available through MartPe. We reserve Our right to bar any such activity.
        </Text>

        <Text style={styles.paragraph}>
          You shall not attempt to gain unauthorized access to any portion or feature of MartPe, or any other systems or networks connected to MartPe or to any server, computer, network, or to any of the services offered on or through MartPe, by hacking, password "mining" or any other illegitimate means.
        </Text>

        <Text style={styles.subHeading}>Security and Testing</Text>
        <Text style={styles.paragraph}>
          You shall not probe, scan or test the vulnerability of MartPe or any network connected to MartPe nor breach the security or authentication measures on MartPe or any network connected to MartPe. You shall not reverse look-up/engineer, trace or seek to trace any information on any other User of or visitor to MartPe, or any other customer, including any Account on MartPe not owned by You, to its source, or exploit MartPe or any service or information made available or offered by or through MartPe, in any way where the purpose is to reveal any information, including but not limited to personal identification or information, other than Your own information, as provided for by MartPe.
        </Text>

        <Text style={styles.subHeading}>Reputation and Brand Protection</Text>
        <Text style={styles.paragraph}>
          You shall not make any disparaging or defamatory statement(s) or comment(s) about Us or the brand name or domain name used by Us or otherwise engage in any conduct or action that might tarnish the image or reputation, of PSSPL or Sellers on MartPe or otherwise tarnish or dilute any of PSSPL's trade or service Marks, trade name and/or goodwill associated with such trade or service marks, trade name as may be owned or used by Us.
        </Text>

        <Text style={styles.paragraph}>
          You agree not to use any device, software or routine to interfere or attempt to interfere with the proper working of MartPe or the Open Network for Digital Commerce or any transaction being conducted on MartPe, or with any other person's use of MartPe.
        </Text>

        <Text style={styles.paragraph}>
          You shall not forge headers or otherwise manipulate identifiers in order to disguise the origin of any message or transmittal You send to Us on or through MartPe or any service offered on or through MartPe.
        </Text>

        <Text style={styles.sectionHeading}>Legal Compliance</Text>
        <Text style={styles.paragraph}>
          You shall at all times ensure full compliance with the applicable provisions of the Information Technology Act, 2000 and rules thereunder as applicable and as amended from time to time and also all applicable domestic laws, rules and regulations (including the provisions of any applicable Exchange Control Laws or regulations in force) and International Laws, Foreign Exchange Laws, Statutes, Ordinances and Regulations (including, but not limited to GST, Income Tax, Custom Duty and Local and Central Levies) regarding Your use of Our service and Your listing, purchase, solicitation of offers to purchase, and sale of Products. You shall not engage in any transaction in an item or service, which is prohibited by the provisions of any applicable law including exchange control laws or regulations for the time being in force.
        </Text>

        <Text style={styles.sectionHeading}>Information Rights</Text>
        <Text style={styles.paragraph}>
          Solely to enable Us to use the information You supply Us with, so that We are not violating any rights You might have in Your information, You agree to grant Us a non-exclusive, worldwide, perpetual, irrevocable, royalty-free, sub-licensable (through multiple tiers) right to exercise the copyright, publicity, database rights or any other rights You have in Your information, in any media now known or not currently known, with respect to Your information, which will include sharing of Your information with Our affiliates, subsidiaries and third parties. We will only use and/or share Your information in accordance with the T&C and Privacy Policy applicable to use of MartPe.
        </Text>

        <Text style={styles.sectionHeading}>Content Monitoring</Text>
        <Text style={styles.paragraph}>
          PSSPL reserves the right, but has no obligation, to monitor the materials posted on MartPe. PSSPL shall have the right to remove or edit any content that in its sole discretion violates, or is alleged to violate, any applicable law or either the spirit or letter of these T&C. Please be advised that such Content posted does not necessarily reflect PSSPL's views. In no event shall PSSPL assume or have any responsibility or liability for any Content posted or for any claims, damages or losses resulting from use of Content and/or appearance of Content on MartPe.
        </Text>

        <Text style={styles.paragraph}>
          You understand and acknowledge that by using MartPe or any of the MartPe Services, You may encounter Content that may be deemed by some Users to be offensive, indecent, or objectionable, which Content may or may not be identified as such. You agree to use MartPe and any MartPe Services at Your sole risk and that to the fullest extent permitted under applicable law. PSSPL shall have no liability to You for Content that may be deemed offensive, indecent, or objectionable to You.
        </Text>

        <Text style={styles.sectionHeading}>Account and Membership</Text>
        <Text style={styles.paragraph}>
          You may access MartPe by registering to create an account (<Text style={styles.bold}>"Account"</Text>) and become a member (<Text style={styles.bold}>"Membership"</Text>).
        </Text>

        <Text style={styles.paragraph}>
          If You use MartPe, You shall be responsible for maintaining the confidentiality of Your display name and password, and You shall be responsible for all activities that occur under Your display name and password. You agree that if You provide any information that is untrue, inaccurate, not current or incomplete, or We have reasonable grounds to suspect that such information is untrue, inaccurate, not current or incomplete, or not in accordance with the this T&C, We shall have the right to indefinitely suspend or terminate or block access of Your Membership on MartPe and refuse to provide You with access to MartPe. You shall be solely liable and responsible for all the activities undertaken under Your Account, and any consequences therefrom.
        </Text>

        <Text style={styles.paragraph}>
          Your mobile phone number and/or e-mail address is treated as Your primary identifier on MartPe. It is Your responsibility to ensure that Your mobile phone number and Your email address is up to date on MartPe at all times. You agree to notify Us promptly if Your mobile phone number or e-mail address changes by updating the same on MartPe through a onetime password verification.
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

  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
