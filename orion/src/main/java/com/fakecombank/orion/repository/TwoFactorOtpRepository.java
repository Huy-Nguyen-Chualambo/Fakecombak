package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.TwoFactorOTP;

public interface TwoFactorOtpRepository extends JpaRepository<TwoFactorOTP, String> {
    TwoFactorOTP findByUserId(Long userId);
}
