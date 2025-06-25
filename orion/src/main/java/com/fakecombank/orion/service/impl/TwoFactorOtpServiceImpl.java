package com.fakecombank.orion.service.impl;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.model.TwoFactorOTP;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.TwoFactorOtpRepository;
import com.fakecombank.orion.service.TwoFactorOtpService;

@Service
public class TwoFactorOtpServiceImpl implements TwoFactorOtpService {
    @Autowired
    private TwoFactorOtpRepository twoFactorOtpRepository;

    @Override
    public TwoFactorOTP createTwoFactorOTP(User user, String otp, String jwt) {
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        TwoFactorOTP twoFactorOTP = new TwoFactorOTP();

        twoFactorOTP.setOtp(otp);
        twoFactorOTP.setJwt(jwt);
        twoFactorOTP.setId(id);
        twoFactorOTP.setUser(user);
        twoFactorOtpRepository.save(twoFactorOTP);

        return twoFactorOTP;
    }

    @Override
    public TwoFactorOTP findByUser(Long userId) {
        
        return twoFactorOtpRepository.findByUserId(userId);
    }

    @Override
    public TwoFactorOTP findById(String id) {

        Optional<TwoFactorOTP> opt = twoFactorOtpRepository.findById(id);
        
        return opt.orElse(null);
    }

    @Override
    public Boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOTP, String otp) {
        
        return twoFactorOTP.getOtp().equals(otp);
    }

    @Override
    public void deleteTwoFactorOTP(TwoFactorOTP twoFactorOTP) {
        twoFactorOtpRepository.delete(twoFactorOTP);
    }
}
