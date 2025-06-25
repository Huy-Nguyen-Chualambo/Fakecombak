package com.fakecombank.orion.model;

import com.fakecombank.orion.constant.VerificationMethod;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class VerificationCode {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    private String otp;
    @OneToOne
    private User user;
    private String email;
    private String mobile;
    private VerificationMethod verificationMethod;
}
