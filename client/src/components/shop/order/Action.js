import { createOrder } from "./FetchApi";

export const fetchData = async (cartListProduct, dispatch) => {
  dispatch({ type: "loading", payload: true });
  try {
    let responseData = await cartListProduct();
    if (responseData && responseData.Products) {
      setTimeout(function () {
        dispatch({ type: "cartProduct", payload: responseData.Products });
        dispatch({ type: "loading", payload: false });
      }, 1000);
    }
  } catch (error) {
    console.log(error);
  }
};

// TEMP DISABLED PAYMENT: fetch BrainTree token
// export const fetchbrainTree = async (getBrainTreeToken, setState) => {
//   try {
//     let responseData = await getBrainTreeToken();
//     if (responseData && responseData) {
//       setState({
//         clientToken: responseData.clientToken,
//         success: responseData.success,
//       });
//       console.log(responseData);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };

// TEMP DISABLED PAYMENT: payment logic
// export const pay = async (
//   data,
//   dispatch,
//   state,
//   setState,
//   getPaymentProcess,
//   totalCost,
//   history
// ) => {
//   console.log(state);
//   if (!state.address) {
//     setState({ ...state, error: "Please provide your address" });
//   } else if (!state.phone) {
//     setState({ ...state, error: "Please provide your phone number" });
//   } else {
//     let nonce;
//     state.instance
//       .requestPaymentMethod()
//       .then((data) => {
//         dispatch({ type: "loading", payload: true });
//         nonce = data.nonce;
//         let paymentData = {
//           amountTotal: totalCost(),
//           paymentMethod: nonce,
//         };
//         getPaymentProcess(paymentData)
//           .then(async (res) => {
//             if (res) {
//               let orderData = {
//                 allProduct: JSON.parse(localStorage.getItem("cart")),
//                 user: JSON.parse(localStorage.getItem("jwt")).user._id,
//                 amount: res.transaction.amount,
//                 transactionId: res.transaction.id,
//                 address: state.address,
//                 phone: state.phone,
//               };
//               try {
//                 let resposeData = await createOrder(orderData);
//                 if (resposeData.success) {
//                   localStorage.setItem("cart", JSON.stringify([]));
//                   dispatch({ type: "cartProduct", payload: null });
//                   dispatch({ type: "cartTotalCost", payload: null });
//                   dispatch({ type: "orderSuccess", payload: true });
//                   setState({ clientToken: "", instance: {} });
//                   dispatch({ type: "loading", payload: false });
//                   return history.push("/");
//                 } else if (resposeData.error) {
//                   console.log(resposeData.error);
//                 }
//               } catch (error) {
//                 console.log(error);
//               }
//             }
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//       })
//       .catch((error) => {
//         console.log(error);
//         setState({ ...state, error: error.message });
//       });
//   }
// };

// New: Create order without payment (no gateway). Uses address/phone and cart
export const placeOrderWithoutPayment = async (
  data,
  dispatch,
  state,
  setState,
  totalCost,
  history
) => {
  if (!state.address) {
    setState({ ...state, error: "Please provide your address" });
    return;
  }
  if (!state.phone) {
    setState({ ...state, error: "Please provide your phone number" });
    return;
  }

  try {
    dispatch({ type: "loading", payload: true });
    const orderData = {
      allProduct: JSON.parse(localStorage.getItem("cart")),
      user: JSON.parse(localStorage.getItem("jwt")).user._id,
      amount: totalCost(),
      transactionId: "NO_PAYMENT",
      address: state.address,
      phone: state.phone,
    };

    const response = await createOrder(orderData);
    if (response && response.success) {
      localStorage.setItem("cart", JSON.stringify([]));
      dispatch({ type: "cartProduct", payload: null });
      dispatch({ type: "cartTotalCost", payload: null });
      dispatch({ type: "orderSuccess", payload: true });
      setState({ ...state, error: false, success: true });
      dispatch({ type: "loading", payload: false });
      history.push("/");
    } else if (response && response.error) {
      setState({ ...state, error: response.error });
      dispatch({ type: "loading", payload: false });
    } else {
      dispatch({ type: "loading", payload: false });
    }
  } catch (error) {
    console.log(error);
    dispatch({ type: "loading", payload: false });
    setState({ ...state, error: "Failed to create order" });
  }
};
