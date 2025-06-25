package com.fakecombank.orion.service;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.ForgotPasswordToken;
import com.fakecombank.orion.model.User;

public interface ForgotPasswordService {

    ForgotPasswordToken creatToken(User user,String id, String otp, VerificationMethod verificationMethod,String sendTo);

    ForgotPasswordToken findById(String id);

    ForgotPasswordToken findByUserId(Long userId);

    void deleteToken(ForgotPasswordToken forgotPasswordToken);
}
