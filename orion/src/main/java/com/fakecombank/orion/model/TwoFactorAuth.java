package com.fakecombank.orion.model;

import com.fakecombank.orion.constant.VerificationMethod;

import lombok.Data;

@Data
public class TwoFactorAuth {
    private boolean isEnabled = false;
    private VerificationMethod verificationMethod;
}
