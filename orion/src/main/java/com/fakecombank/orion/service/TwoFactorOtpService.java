package com.fakecombank.orion.service;

import com.fakecombank.orion.model.TwoFactorOTP;
import com.fakecombank.orion.model.User;

public interface TwoFactorOtpService {

    TwoFactorOTP createTwoFactorOTP(User user, String otp,String jwt);

    TwoFactorOTP findByUser(Long userId);

    TwoFactorOTP findById(String id);

    Boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOTP, String otp);

    void deleteTwoFactorOTP(TwoFactorOTP twoFactorOTP);
}
