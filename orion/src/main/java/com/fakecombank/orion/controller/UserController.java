package com.fakecombank.orion.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.constant.VerificationMethod;
import com.fakecombank.orion.model.ForgotPasswordToken;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.VerificationCode;
import com.fakecombank.orion.request.ForgotPasswordTokenRequest;
import com.fakecombank.orion.request.ResetPasswordRequest;
import com.fakecombank.orion.response.ApiResponse;
import com.fakecombank.orion.response.AuthResponse;
import com.fakecombank.orion.service.EmailService;
import com.fakecombank.orion.service.ForgotPasswordService;
import com.fakecombank.orion.service.UserService;
import com.fakecombank.orion.service.VerificationCodeService;
import com.fakecombank.orion.utils.OtpUtils;

@RestController
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private VerificationCodeService verificationCodeService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private ForgotPasswordService forgotPasswordService;

    @GetMapping("/api/users/profile")
    public ResponseEntity<?> getUserProfile(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/api/users/verification/{verificationMethod}/send-otp")
    public ResponseEntity<?> sendVerificationOtp(
            @RequestHeader("Authorization") String jwt,
            @PathVariable VerificationMethod verificationMethod) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUserId(user.getId());

        if (verificationCode == null) {
            verificationCode = verificationCodeService.sendVerificationCode(user, verificationMethod);
        }

        if (verificationMethod == VerificationMethod.EMAIL) {
            emailService.sendVerificationOtpEmail(user.getEmail(), verificationCode.getOtp());
        }

        return new ResponseEntity<>("Verfication otp sent successfully", HttpStatus.OK);
    }

    @PatchMapping("/api/users/enable-2fa/verify-otp/{otp}")
    public ResponseEntity<?> enableTwoFactorAuthentication(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String otp) {
        User user = userService.findUserProfileByJwt(jwt);

        VerificationCode verificationCode = verificationCodeService.getVerificationCodeByUserId(user.getId());

        String sendTo = verificationCode.getVerificationMethod() == VerificationMethod.EMAIL
                ? user.getEmail()
                : user.getMobile();

        Boolean isVerified = verificationCode.getOtp().equals(otp);

        if (isVerified) {
            User updatedUser = userService.enableTwoFactorAuthentication(verificationCode.getVerificationMethod(), sendTo, user);

            verificationCodeService.deleteVerificationCodeById(verificationCode);

            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        }

        throw new RuntimeException("Invalid OTP");
    }

    @PostMapping("/auth/users/reset-password/send-otp")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestBody ForgotPasswordTokenRequest request) throws Exception {

        User user = userService.findUserByEmail(request.getSendTo());
        String otp = OtpUtils.generateOtp();
        UUID uuid = UUID.randomUUID();
        String id = uuid.toString();

        ForgotPasswordToken token = forgotPasswordService.findByUserId(user.getId());

        if (token == null) {
            token = forgotPasswordService.creatToken(user, id, otp, request.getVerificationMethod(), request.getSendTo());
        }

        if (request.getVerificationMethod().equals(VerificationMethod.EMAIL)) {
            emailService.sendVerificationOtpEmail(user.getEmail(), token.getOtp());
        }

        AuthResponse response = new AuthResponse();

        response.setSession(token.getId());
        response.setMessage("Forgot password otp sent successfully");
        
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/auth/users/reset-password/verify-otp")
    public ResponseEntity<?> resetPassword(
                @RequestHeader("Authorization") String jwt,
                @RequestParam String id,
                @RequestBody ResetPasswordRequest request) {

        ForgotPasswordToken forgotPasswordToken = forgotPasswordService.findById(id);

        boolean isVerified = forgotPasswordToken.getOtp().equals(request.getOtp());

        if (isVerified) {
            userService.updatePassword(forgotPasswordToken.getUser(), request.getPassword());

            ApiResponse response = new ApiResponse();
            response.setMessage("Password reset successfully");

            return new ResponseEntity<>(response, HttpStatus.ACCEPTED);
        }
        throw new RuntimeException("Invalid OTP");
    }
}
