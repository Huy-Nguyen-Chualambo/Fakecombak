package com.fakecombank.orion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.constant.PaymentMethod;
import com.fakecombank.orion.model.PaymentOrder;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.response.PaymentResponse;
import com.fakecombank.orion.service.PaymentService;
import com.fakecombank.orion.service.UserService;
import com.stripe.exception.StripeException;

@RestController
public class PaymentController {
    @Autowired
    private UserService userService;
    @Autowired
    private PaymentService paymentService;

    @PostMapping("/api/payment/{paymentMethod}/amount/{amount}")
    public ResponseEntity<PaymentResponse> paymentHandler(@PathVariable PaymentMethod paymentMethod,
            @PathVariable Long amount, @RequestHeader("Authorization") String jwt)
            throws StripeException {
        User user = userService.findUserProfileByJwt(jwt);
        PaymentResponse paymentResponse;
        PaymentOrder paymentOrder = paymentService.createOrder(user, amount, paymentMethod);

        // if (paymentResponse.equals(PaymentMethod.VNPAY)) {
        // paymentResponse = paymentService.createVNPayPaymentLink(user, amount,
        // paymentOrder.getId());
        // }

        // if (paymentMethod.equals(PaymentMethod.VNPAY)) {
            // paymentResponse = paymentService.createRazorpayPaymentLink(user, amount);
        // } else {
            paymentResponse = paymentService.createStripePaymentLink(user, amount, paymentOrder.getId());
        // }

        return new ResponseEntity<>(paymentResponse, HttpStatus.CREATED);
    }
}
