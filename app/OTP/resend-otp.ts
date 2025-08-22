export const resendOTP = async ({
  orderId,
  phoneNumber,
}: {
  orderId: string;
  phoneNumber: string;
}) => {
  const url = `${process.env.EXPO_PUBLIC_API_URL}/get-otp?action=gen&sendTo=${phoneNumber}&orderId=${orderId}`;

  console.log("Resend OTP URL (with action=gen):", url);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Resend OTP response status:", res.status);

    if (res.status !== 200) {
      const data = await res.json();
      return { status: res.status, data };
    }

    const data = await res.json();
    return { status: 200, data };
  } catch (error) {
    return { status: 500, data: { error: { message: "resend otp failed" } } };
  }
};

// Alternative version - try without orderId first (like initial generation)
export const resendOTPWithoutOrderId = async ({
  orderId,
  phoneNumber,
}: {
  orderId: string;
  phoneNumber: string;
}) => {
  // Exactly like generateOTP - no orderId parameter
  const url = `${process.env.EXPO_PUBLIC_API_URL}/get-otp?action=gen&sendTo=${phoneNumber}`;
  try {
    const res = await fetch(url);

    if (res.status !== 200) {
      const data = await res.json();
      return { status: res.status, data };
    }

    const data = await res.json();
    return { status: 200, data };
  } catch (error) {
    return { status: 500, data: { error: { message: "resend otp failed" } } };
  }
};

export default function OTPPage() {
  return null;
}
