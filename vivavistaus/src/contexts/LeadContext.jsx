import React, { createContext, useState } from 'react';

// Create the context
export const LeadContext = createContext();

// Create the provider
export const LeadProvider = ({ children }) => {
  const [leadPrice, setLeadPrice] = useState(null);
  const [dealIdform, setDealIdForm] = useState(null);
  const [dealtitleform, setDealtitleForm] = useState('');
  const [adultCount, setAdultCount] = useState(1);
const [totalPrice,setTotalPrice]=useState(null);
  return (
    <LeadContext.Provider
      value={{
        leadPrice, setLeadPrice,
        dealIdform, setDealIdForm,
        dealtitleform, setDealtitleForm,
        adultCount, setAdultCount,totalPrice
        ,setTotalPrice
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};
