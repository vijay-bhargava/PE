import React, { createContext, useContext, useReducer } from "react";
import { initialState } from "./reducer";
export const StateContext = createContext([initialState, () => initialState]);
export const StateProvider = ({ reducer, children, initialState }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  function thousands_separators(num) {
    
    let str = "";
  
    if (num != null && num != undefined) {
        // Check if num is a string, then convert it to a float
        if (typeof num === "string") {
            num = parseFloat(num); // Convert string to float
        }

        // Check if num is a valid number (not NaN)
        if (!isNaN(num)) {
            str = num.toLocaleString(state.culturecode ?? "en-IN", {
                minimumFractionDigits: 0, // Minimum number of decimal places
                maximumFractionDigits: 4, // Maximum number of decimal places
            });
        } else {
            str = ""; // Return empty string if num is not a valid number
        }
    }

    return str;
}
  return (
    <StateContext.Provider value={[state, dispatch,thousands_separators]}>
      {children}
    </StateContext.Provider>
  );
};
export const useStateValue = () => useContext(StateContext);
