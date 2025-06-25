package com.fakecombank.orion.service;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.VerificationCode;

public interface VerificationCodeService {

    VerificationCode sendVerificationCode(User user, VerificationMethod verificationMethod);

    VerificationCode getVerificationCodeById(Long id);

    VerificationCode getVerificationCodeByUserId(Long userId);

    void deleteVerificationCodeById(VerificationCode verificationCode);
}
