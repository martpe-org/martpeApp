export const uploadOnPresignedURLAction = async (url: string, fileUri: string, mimeType: string) => {
  try {
    // Fetch the file from the local URI and convert to Blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to presigned URL
    const uploadRes = await fetch(url, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": mimeType, // e.g., "image/jpeg" or "image/png"
      },
    });

    if (!uploadRes.ok) {
      console.log("❌ Something went wrong in image upload!!!");
      throw new Error(`Upload failed with status ${uploadRes.status}`);
    }

    console.log("✅ Upload successful!");
    return true;
  } catch (err) {
    console.log("uploadResError ", err);
    return false;
  }
};
