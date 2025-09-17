export const cancelOrder = async (
  orderId: string,
  reasonCode: string,
  at: string
) => {
  try {
    console.log('cancl_argu ', orderId, reasonCode);
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${at}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId,
        reason_code: reasonCode
      })
    });

    console.log('canclRes ', res);

    if (!res.ok) {
      return {
        success: false,
        error: 'Something went wrong in cancelling the order!'
      };
    }

    const contentType = res.headers.get('Content-Type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await res.json();
      console.log('cancelData ', data);
      return { success: true, data: 'Cancelled' };
    } else {
      console.log('Non-JSON response');
      return { success: true, data: 'Cancelled' };
    }
  } catch (error) {
    console.log('Error in cancelling order! ', error);
    return {
      success: false,
      error: 'Something went wrong in cancelling the order!'
    };
  }
};
