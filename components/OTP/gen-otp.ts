export const generateOTP = async (phoneNumber: string) => {
  try {
    const res = await fetch(
`${process.env.EXPO_PUBLIC_API_URL}/get-otp?action=gen&sendTo=${phoneNumber}`
    );

    if (res.status !== 200) {
      const data = await res.json();
      console.log('OTP Error Response:', data);
      return { status: res.status, data };
    }

    const data = await res.json();
    return { status: 200, data };
  } catch (error) {
    console.log('Fetch error:', error);
    return { status: 500, data: { error: { message: 'gen otp failed' } } };
  }
};
// Add this to resolve the default export warning
export default function GenerateOTPPage() {
  return null;
}