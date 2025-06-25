package com.fakecombank.orion.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {
    private JavaMailSender javaMailSender;

    public void sendVerificationOtpEmail(String email, String otp) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

        String subject = "Your OTP for Verification";
        String content = "<p>Dear User,</p>"
                + "<p>Your OTP for verification is: <strong>" + otp + "</strong></p>"
                + "<p>Thank you!</p>";

        helper.setSubject(subject);
        helper.setText(content, true);
        helper.setTo(email);

        try {
            javaMailSender.send(message);
        } catch (Exception e) {
            throw new MessagingException("Failed to send email", e);
        }
    }
}
