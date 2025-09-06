export const selectCart = async (
  authToken: string,
  lat: number,
  lon: number,
  pincode: string,
  context: {
    domain: string;
    bpp_uri: string;
    bpp_id: string;
    core_version: string;
  },
  provider_id: string,
  location_id: string,
  storeId: string,
  deliveryAddressId: string,
  offerId?: string,
) => {
  try {
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/v1/select-cart`, {
      method: "POST",
      body: JSON.stringify({
        lat,
        lon,
        pincode,
        context,
        provider_id,
        location_id,
        storeId,
        deliveryAddressId,
        ...(offerId ? { offerId } : {}),
      }),
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
    });

    // if (res.status !== 200) {
    //   console.log("create user failed");
    //   const data = await res.json();
    //   return { status: res.status, data };
    // }

    const data = await res.json();
    return { status: res.status, data };
  } catch (error) {
    console.log("Checkout error ", error);
    return { status: 500, data: { error: { message: "checkout failed" } } };
  }
};
