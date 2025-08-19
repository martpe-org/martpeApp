type UpdateFavParams = {
  action: string;
  entity: string;
  slug: string;
};

export const updateFavAction = async (
  authToken: string,
  { action, entity, slug }: UpdateFavParams
): Promise<{ success: boolean }> => {
  try {
    if (!process.env.EXPO_PUBLIC_API_URL) {
      throw new Error('BASE_URL is not defined');
    }

    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/favs`, {
      method: 'PUT',
      body: JSON.stringify({ action, entity, slug }),
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (e) {
    console.error('updateFavAction error:', e);
    return { success: false };
  }
};
