package com.fakecombank.orion.utils;

public class OtpUtils {
    
    public static String generateOtp() {
        int otp = (int) (Math.random() * 900000) + 100000; // Generate a 6-digit OTP
        return String.valueOf(otp);
    }
}
