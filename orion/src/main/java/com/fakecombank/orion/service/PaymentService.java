package com.fakecombank.orion.service;

import com.fakecombank.orion.constant.PaymentMethod;
import com.fakecombank.orion.model.PaymentOrder;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.response.PaymentResponse;
import com.stripe.exception.StripeException;

public interface PaymentService {

    PaymentOrder createOrder(User user, Long amount, PaymentMethod paymentMethod);

    PaymentOrder getPaymentOrderById(Long id);

    Boolean proceedPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws Exception;

    // PaymentResponse createVNPayPaymentLink(User user, Long amount, Long orderId);

    // PaymentResponse createVNPayPaymentLink(User user, Long amount, Long orderId) throws RazorpayException;

    PaymentResponse createStripePaymentLink(User user, Long amount, Long orderId) throws StripeException;
}
