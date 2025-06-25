package com.fakecombank.orion.service.impl;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.PaymentMethod;
import com.fakecombank.orion.constant.PaymentOrderStatus;
import com.fakecombank.orion.model.PaymentOrder;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.PaymentOrderRepository;
import com.fakecombank.orion.response.PaymentResponse;
import com.fakecombank.orion.service.PaymentService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

@Service
public class PaymentServiceImpl implements PaymentService {
    @Autowired
    private PaymentOrderRepository paymentOrderRepository;
    @Value("${stripe.api.key}")
    private String stripeSecretKey;
    @Value("${paypal.client-id}")
    private String clientId;
    @Value("${paypal.client-secret}")
    private String clientSecret;
    @Value("${paypal.mode}")
    private String mode;
    // @Value("$(razorpay.api.key)")
    // private String apiKey;
    // @Value("$(razorpay.api.secret)")
    // private String apiSecretKey;

    @Override
    public PaymentOrder createOrder(User user, Long amount, PaymentMethod paymentMethod) {
        PaymentOrder paymentOrder = new PaymentOrder();

        paymentOrder.setUser(user);
        paymentOrder.setAmount(amount);
        paymentOrder.setPaymentMethod(paymentMethod);
        paymentOrder.setStatus(PaymentOrderStatus.PENDING);

        return paymentOrderRepository.save(paymentOrder);
    }

    @Override
    public PaymentOrder getPaymentOrderById(Long id) {

        return paymentOrderRepository.findById(id).orElseThrow(() -> new RuntimeException("Payment order not found"));
    }

    @Override
    public Boolean proceedPaymentOrder(PaymentOrder paymentOrder, String paymentId) throws Exception {

        if (paymentOrder.getStatus() == null) {
            paymentOrder.setStatus(PaymentOrderStatus.PENDING);
        }

        if (paymentOrder.getStatus().equals(PaymentOrderStatus.PENDING)) {

            // if (paymentOrder.getPaymentMethod().equals(PaymentMethod.RAZORPAY)) {
            // RazorpayClient razorpayClient = new RazorpayClient(apiKey, apiSecretKey);
            // Payment payment = razorpayClient.payments.fetch(paymentId);
            // Integer amount = payment.get("amount");
            // String status = payment.get("status");

            // if (status.equals("captured")) {
            // paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);

            // return true;
            // } else {
            // paymentOrder.setStatus(PaymentOrderStatus.FAILED);
            // paymentOrderRepository.save(paymentOrder);
            // return false;
            // }
            // }

            paymentOrder.setStatus(PaymentOrderStatus.SUCCESS);
            paymentOrderRepository.save(paymentOrder);
            return true;
        }

        return false;
    }

    // @Override
    // public PaymentResponse createRazorpayPaymentLink(User user, Long amount)
    // throws RazorpayException {
    // Long Amount = amount * 100;

    // try {
    // RazorpayClient razorpay = new RazorpayClient(apiKey, apiSecretKey);

    // JSONObject paymentLinkRequest = new JSONObject();
    // paymentLinkRequest.put("amount", Amount);
    // paymentLinkRequest.put("currency", "INR");

    // JSONObject customer = new JSONObject();
    // customer.put("name", user.getFullName());
    // customer.put("email", user.getEmail());
    // paymentLinkRequest.put("customer", customer);

    // JSONObject notify = new JSONObject();
    // notify.put("email", true);
    // paymentLinkRequest.put("notify", notify);

    // paymentLinkRequest.put("reminder_enable", true);

    // paymentLinkRequest.put("callback_url", "your_callback_url");
    // paymentLinkRequest.put("callback_method", "get");

    // PaymentLink payment = razorpay.paymentLink.create(paymentLinkRequest);
    // String paymentLinkId = payment.get("id");
    // String paymentLinkUrl = payment.get("short_url");

    // PaymentResponse response = new PaymentResponse();
    // response.setPayment_url(paymentLinkId);

    // return response;
    // } catch (RazorpayException e) {
    // System.out.println("Error creating Razorpay payment link: " +
    // e.getMessage());
    // throw new RazorpayException(e.getMessage());
    // }
    // }

    @Override
    public PaymentResponse createStripePaymentLink(User user, Long amount, Long orderId) throws StripeException {
        Stripe.apiKey = stripeSecretKey;

        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/dashboard?order_id=" + orderId + "&payment_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:3000/dashboard/payment/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Topup to wallet")
                                        .build())
                                .setUnitAmount(amount * 100)
                                .build())
                        .setQuantity(1L)
                        .build())
                .build();

        Session session = Session.create(params);

        System.out.println("Stripe session created: " + session);

        PaymentResponse response = new PaymentResponse();
        response.setPayment_url(session.getUrl());
        response.setPayment_id(session.getId());

        return response;
    }
}
