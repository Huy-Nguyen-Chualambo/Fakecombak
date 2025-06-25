package com.fakecombank.orion.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.config.JwtProvider;
import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.TwoFactorAuth;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.UserRepository;
import com.fakecombank.orion.service.UserService;

@RestController
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public User findUserProfileByJwt(String jwt) {
        String email = JwtProvider.getEmailFromToken(jwt);
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

    @Override
    public User findUserByEmail(String email) {
        User user = userRepository.findByEmail(email);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        return user;
    }

    @Override
    public User findUserById(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new RuntimeException("User not found");
        }
    }

    @Override
    public User updatePassword(User user, String newPassword) {
        user.setPassword(newPassword);
        userRepository.save(user);
        return user;
    }

    @Override
    public User enableTwoFactorAuthentication(VerificationMethod verificationMethod, String sendTo, User user) {
        TwoFactorAuth twoFactorAuth = new TwoFactorAuth();
        twoFactorAuth.setEnabled(true);
        twoFactorAuth.setVerificationMethod(verificationMethod);

        user.setTwoFactorAuth(twoFactorAuth);

        userRepository.save(user);
        return user;
    }
}
