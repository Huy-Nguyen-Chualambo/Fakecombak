package com.fakecombank.orion.service;

import com.fakecombank.orion.model.PaymentDetails;
import com.fakecombank.orion.model.User;

public interface PaymentDetailsService {

    public PaymentDetails addPaymentDetails(String accountNumber, String accountHolderName, String ifsc,
            String bankName, User user);

    public PaymentDetails getUsersPaymentDetails(User user);
}
