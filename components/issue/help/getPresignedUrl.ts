export const getPresignedUrlAction = async (images: string[]) => {
  try {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/digitalassets/presignedurl`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetNames: images,
          type: "returns",
        }),
      }
    );

    console.log("Return Img Upload Response: ", response);

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`);
    }

    const data = await response.json();

    console.log("Return Img Upload Data: ", data);
    return data;
  } catch (err) {
    console.log("Return img upload error: ", err);
    return null;
  }
};
