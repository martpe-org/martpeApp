export const uploadOnPresignedURLAction = async (url: string, fileUri: string, mimeType: string) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // For React Native, we need to format the file object properly
    const fileObject = {
      uri: fileUri,
      type: mimeType,
      name: fileUri.split('/').pop() || 'image.jpg',
    } as any;

    // Upload directly to presigned URL using fetch with the file
    const uploadRes = await fetch(url, {
      method: "PUT",
      body: fileObject,
      headers: {
        "Content-Type": mimeType,
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