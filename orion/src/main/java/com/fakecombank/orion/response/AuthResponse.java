package com.fakecombank.orion.response;

import lombok.Data;

@Data
public class AuthResponse {
    private String jwt;
    private Boolean status;
    private String message;
    private Boolean isTwoFactorEnabled;
    private String session;
}
