import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getPresignedUrlAction(images: string[]) {
  try {
    if (images.length === 0) return null;

    // Optional: include auth token if required by backend
    const authToken = await AsyncStorage.getItem("auth-token");

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/digitalassets/presignedurl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({
          assetNames: images,
          type: "returns",
        }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to get presigned URLs");
    }

    const data = await response.json();
    console.log("ReturnImgUploadData:", data);
    return data;
  } catch (err) {
    console.error("Return img upload error:", err);
    return null;
  }
}
