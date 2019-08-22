import { CART_START, CART_SUCCESS, CART_FAIL } from "./actionTypes";
import { authAxios } from "../../utils";
import { orderSummaryURL } from "../../constants";

export const cartStart = () => {
  return {
    type: CART_START
  };
};

export const cartSuccess = data => {
  return {
    type: CART_SUCCESS,
    data
  };
};

export const cartFail = error => {
  return {
    type: CART_FAIL,
    error: error
  };
};

export const fetchCart = () => {
  return dispatch => {
    dispatch(cartStart());
    authAxios
      .get(orderSummaryURL)
      .then(res => {
        dispatch(cartSuccess(res.data));
      })
      .catch(err => {
        dispatch(cartFail(err));
      });
  };
};
