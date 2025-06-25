package com.fakecombank.orion.request;

import com.fakecombank.orion.constant.VerificationMethod;

import lombok.Data;

@Data
public class ForgotPasswordTokenRequest {
    private String sendTo;
    private VerificationMethod verificationMethod;
}
