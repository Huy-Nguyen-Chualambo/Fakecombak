package com.fakecombank.orion.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.ForgotPasswordToken;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.ForgotPasswordRepository;
import com.fakecombank.orion.service.ForgotPasswordService;

@Service
public class ForgotPasswordImpl implements ForgotPasswordService {
    @Autowired
    private ForgotPasswordRepository forgotPasswordRepository;

    @Override
    public ForgotPasswordToken creatToken(User user, String id, String otp, VerificationMethod verificationMethod, String sendTo) {
        ForgotPasswordToken token = new ForgotPasswordToken();

        token.setUser(user);
        token.setSendTo(sendTo);
        token.setVerificationMethod(verificationMethod);
        token.setOtp(otp);
        token.setId(id);

        forgotPasswordRepository.save(token);
        return token;
    }

    @Override
    public ForgotPasswordToken findById(String id) {
        Optional<ForgotPasswordToken> token = forgotPasswordRepository.findById(id);

        if (token.isPresent()) {
            return token.get();
        } else {
            throw new RuntimeException("Token not found");
        }
    }

    @Override
    public ForgotPasswordToken findByUserId(Long userId) {
        
        return forgotPasswordRepository.findByUserId(userId);
    }

    @Override
    public void deleteToken(ForgotPasswordToken forgotPasswordToken) {
        
        forgotPasswordRepository.delete(forgotPasswordToken);
    }
}
