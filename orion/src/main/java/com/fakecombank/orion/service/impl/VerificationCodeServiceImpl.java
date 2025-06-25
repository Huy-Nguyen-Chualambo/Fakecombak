package com.fakecombank.orion.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.VerificationCode;
import com.fakecombank.orion.repository.VerificationCodeRepository;
import com.fakecombank.orion.service.VerificationCodeService;
import com.fakecombank.orion.utils.OtpUtils;

@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {
    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Override
    public VerificationCode sendVerificationCode(User user, VerificationMethod verificationMethod) {
        VerificationCode verificationCode1 = new VerificationCode();

        verificationCode1.setOtp(OtpUtils.generateOtp());
        verificationCode1.setVerificationMethod(verificationMethod);
        verificationCode1.setUser(user);

        verificationCodeRepository.save(verificationCode1);

        return verificationCode1;
    }

    @Override
    public VerificationCode getVerificationCodeById(Long id) {
        Optional<VerificationCode> verificationCode = verificationCodeRepository.findById(id);

        if (verificationCode.isPresent()) {
            return verificationCode.get();
        } else {
            throw new RuntimeException("Verification code not found");
        }
    }

    @Override
    public VerificationCode getVerificationCodeByUserId(Long userId) {
        
        return verificationCodeRepository.findByUserId(userId);
    }

    @Override
    public void deleteVerificationCodeById(VerificationCode verificationCode) {
        
        verificationCodeRepository.delete(verificationCode);
    }

}
