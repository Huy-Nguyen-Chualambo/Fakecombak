package com.fakecombank.orion.model;

import com.fakecombank.orion.constant.VerificationMethod;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class ForgotPasswordToken {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.AUTO)
    private String id;
    @OneToOne
    private User user;
    private String otp;
    private VerificationMethod verificationMethod;
    private String sendTo;
}
