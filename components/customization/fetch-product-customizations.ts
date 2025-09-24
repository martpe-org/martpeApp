
export const fetchProductCustomizations = async (slug: string) => {
  try {
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/products/${slug}/customizations`,
      {
        method: 'GET'
      }
    );

    if (!res.ok) {  
      console.log("Error in customization on api")
      }

    return (await res.json()) as Record<string, any>;
  } catch (error) {
    console.log('Fetch customizations error ', error);
    return null;
  }
};
