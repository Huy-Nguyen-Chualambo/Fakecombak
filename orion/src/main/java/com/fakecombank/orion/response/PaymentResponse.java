package com.fakecombank.orion.response;

import lombok.Data;

@Data
public class PaymentResponse {
    private String payment_url;
    private String payment_id;
}
