
export const fetchProductCustomizations = async (slug: string) => {
  try {
    console.log(
      '-------------->',
      `${process.env.EXPO_PUBLIC_API_URL}/products/${slug}/customizations`
    );
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/products/${slug}/customizations`,
      {
        method: 'GET'
      }
    );

    if (!res.ok) {
      console.log('fetch customizations failed');
      throw new Error();
    }

    return (await res.json()) as Record<string, any>;
  } catch (error) {
    console.log('Fetch customizations error ', error);
    return null;
  }
};
