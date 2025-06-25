package com.fakecombank.orion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.config.JwtProvider;
import com.fakecombank.orion.model.TwoFactorOTP;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.UserRepository;
import com.fakecombank.orion.response.AuthResponse;
import com.fakecombank.orion.service.CustomeUserDetailsService;
import com.fakecombank.orion.service.EmailService;
import com.fakecombank.orion.service.TwoFactorOtpService;
import com.fakecombank.orion.service.WatchlistService;
import com.fakecombank.orion.utils.OtpUtils;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CustomeUserDetailsService customeUserDetailsService;
    @Autowired
    private TwoFactorOtpService twoFactorOtpService;
    @Autowired
    private EmailService emailService;
    @Autowired
    private WatchlistService watchlistService;

    @PostMapping("/signup")
    public ResponseEntity<?> register(@RequestBody User user) {
        
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser != null) {
            return new ResponseEntity<>("Email is already used with another account", HttpStatus.CONFLICT);
        }

        User newUser =new User();

        newUser.setFullName(user.getFullName());
        newUser.setEmail(user.getEmail());
        newUser.setPassword(user.getPassword());
        newUser.setMobile(user.getMobile());

        userRepository.save(newUser);

        watchlistService.createWatchlist(newUser);

        Authentication auth = UsernamePasswordAuthenticationToken
                        .authenticated(user.getEmail(), user.getPassword(), null);
                SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = JwtProvider.generateToken(auth);

        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("User registered successfully");
        
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestBody User user) throws Exception {
        String email = user.getEmail();
        String password = user.getPassword();

        Authentication auth = authenticate(email, password);

        String jwt = JwtProvider.generateToken(auth);

        User existingUser = userRepository.findByEmail(email);

        if (user.getTwoFactorAuth().isEnabled()) {
            AuthResponse res = new AuthResponse();

            res.setMessage("Two-factor authentication is enabled. Please verify your OTP.");
            res.setIsTwoFactorEnabled(true);

            String otp = OtpUtils.generateOtp();

            TwoFactorOTP oldTwoFactorOTP = twoFactorOtpService.findByUser(existingUser.getId());

            if (oldTwoFactorOTP != null) {
                twoFactorOtpService.deleteTwoFactorOTP(oldTwoFactorOTP);
            }

            TwoFactorOTP twoFactorOTP = twoFactorOtpService.createTwoFactorOTP(existingUser, otp, jwt);

            emailService.sendVerificationOtpEmail(email, otp);

            res.setSession(twoFactorOTP.getId());

            return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
        }

        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setStatus(true);
        res.setMessage("User logged in successfully");
        
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    private Authentication authenticate(String email, String password) {
        UserDetails userDetails = customeUserDetailsService.loadUserByUsername(email);

        if (userDetails != null && userDetails.getPassword().equals(password)) {
            return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
        } else {
            throw new BadCredentialsException("Invalid credentials");
        }
    }

    @PostMapping("/two-factor/otp/{otp}")
    public ResponseEntity<?> verifyLoginOtp(@PathVariable String otp, @RequestParam String id) {
        TwoFactorOTP twoFactorOTP = twoFactorOtpService.findById(id);

        if (twoFactorOtpService.verifyTwoFactorOtp(twoFactorOTP, otp)) {
            AuthResponse res = new AuthResponse();
            res.setMessage("Two-factor authentication successful");
            res.setIsTwoFactorEnabled(true);
            res.setJwt(twoFactorOTP.getJwt());
            return new ResponseEntity<>(res, HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Invalid OTP", HttpStatus.UNAUTHORIZED);
        }
    }
}
