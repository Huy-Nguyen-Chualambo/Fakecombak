package com.fakecombank.orion.service;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.User;

public interface UserService {
    
    public User findUserProfileByJwt(String jwt);
    
    public User findUserByEmail(String email);

    public User findUserById(Long userId);

    public User enableTwoFactorAuthentication(VerificationMethod verificationMethod, String sendTo, User user);

    User updatePassword(User user, String newPassword);
}
