import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import { Link, Stack, useRouter } from "expo-router";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { useTranslation } from "react-i18next";
import { generateOTP } from "../../components/OTP/gen-otp";
import useUserDetails from "../../hook/useUserDetails";
import Loader from "@/components/common/Loader";

const PRIMARY_COLOR = "#FB3E44";
const DISABLED_COLOR = "#d9d9d9";
const TEXT_INPUT_COLOR = "#C7C4C4";
const INPUT_WIDTH = widthPercentageToDP("90");
const BUTTON_WIDTH = widthPercentageToDP("90");

const NewLogin: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    isAuthenticated,
    isLoading: authLoading,
    checkAuthentication,
  } = useUserDetails();

  const [mobileNumber, setMobileNumber] = React.useState<string>("");
  const [textInputBorderColor, setTextInputBorderColor] =
    React.useState(TEXT_INPUT_COLOR);
  const [isValidMobileNumber, setIsValidMobileNumber] =
    React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading && isAuthenticated && checkAuthentication()) {
        router.replace("./(tabs)/home");
      }
    };
    checkAuth();
  }, [isAuthenticated, authLoading, checkAuthentication, router]);

  React.useEffect(() => {
    setIsValidMobileNumber(/^\d{10}$/.test(mobileNumber));
  }, [mobileNumber]);

  const generateOtpForUser = async (mobileNumber: string) => {
    try {
      const response = await generateOTP(`${mobileNumber}`);
      if (response.status === 200) {
        router.push({
          pathname: "/(auth)/VerifyOTP",
          params: {
            otpOrderId: encodeURIComponent(response.data.orderId),
            mobileNumber: encodeURIComponent(mobileNumber),
          },
        });
      } else {
        Alert.alert(
          t("Error"),
          response.data?.message || t("Failed to generate OTP")
        );
      }
    } catch (error) {
      Alert.alert(
        t("Error"),
        error instanceof Error
          ? error.message
          : t("An unexpected error occurred")
      );
    }
  };

  const handleContinue = async () => {
    Keyboard.dismiss();
    if (!isValidMobileNumber) {
      Alert.alert(
        t("Invalid number"),
        t("Please enter a valid 10-digit phone number")
      );
      return;
    }
    setIsLoading(true);
    try {
      await generateOtpForUser(mobileNumber);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Loader />
        <Text style={styles.loadingText}>{t("Loading...")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ headerShown: false }} />
          <View style={styles.contentContainer}>
            <Image
              source={require("../../assets/images/martpe-logo.png")}
              style={styles.logo}
              accessibilityLabel="MartPe Logo"
            />
            <Text style={styles.welcomeText}>{t("Welcome to MartPe")}</Text>
            <Text style={styles.subtitleText}>
              {t("Your goto app for everything on ONDC!")}
            </Text>

            <View
              style={[
                styles.inputContainer,
                {
                  borderColor: isValidMobileNumber
                    ? "green"
                    : textInputBorderColor,
                },
              ]}
            >
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                placeholder={t("Enter mobile number")}
                placeholderTextColor={TEXT_INPUT_COLOR}
                keyboardType="number-pad"
                value={mobileNumber}
                maxLength={10}
                onChangeText={setMobileNumber}
                style={styles.inputField}
                onFocus={() => setTextInputBorderColor("#030303")}
                onBlur={() => setTextInputBorderColor(TEXT_INPUT_COLOR)}
              />
            </View>

            <TouchableOpacity
              disabled={!isValidMobileNumber || isLoading}
              onPress={handleContinue}
              style={[
                styles.continueButton,
                {
                  backgroundColor: isValidMobileNumber
                    ? PRIMARY_COLOR
                    : DISABLED_COLOR,
                  opacity: isLoading ? 0.7 : 1,
                },
              ]}
            >
              {isLoading ? <Loader /> : <Text style={styles.continueButtonText}>{t("Continue")}</Text>}
            </TouchableOpacity>

            <Text style={styles.footerText}>
              {t("By continuing, you agree to our")}
              <Link style={styles.footerLink} href="/(aux)/terms-and-conditions">
                {t(" Terms of Service ")}
              </Link>
              & 
              <Link style={styles.footerLink} href="/(aux)/privacy-policy">
                {t(" Privacy Policy")}
              </Link>
            </Text>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "space-between",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: INPUT_WIDTH,
    height: widthPercentageToDP(50),
    resizeMode: "contain",
  },
  welcomeText: {
    fontWeight: "600",
    fontSize: widthPercentageToDP("8"),
    maxWidth: INPUT_WIDTH,
    marginTop: 30,
    textAlign: "center",
  },
  subtitleText: {
    fontWeight: "400",
    fontSize: widthPercentageToDP("4"),
    maxWidth: INPUT_WIDTH,
    textAlign: "center",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    width: INPUT_WIDTH,
  },
  countryCode: {
    fontWeight: "600",
    fontSize: 20,
  },
  inputField: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 20,
    flex: 1,
  },
  continueButton: {
    width: BUTTON_WIDTH,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 20,
  },
  footerText: {
    textAlign: "center",
    fontSize: widthPercentageToDP("2.9"),
    paddingHorizontal: 20,
    marginTop: 20,
  },
  footerLink: {
    color: "#000",
    fontWeight: "bold",
  },
});

export default NewLogin;
