export async function uploadOnPresignedURLAction(url: string, file: File) {
  try {
    const response = await fetch(url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    if (!response.ok) {
      //const errorText = await response.text();
      console.log("Something went wrong in image upload!!! ");
      throw new Error("Something went wrong in image upload!!!");
    }
  } catch (err) {
    console.log("uploadResError ", err);
  }
}
