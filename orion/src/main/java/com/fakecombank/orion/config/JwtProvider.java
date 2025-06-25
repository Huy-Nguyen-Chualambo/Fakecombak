package com.fakecombank.orion.config;

import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import javax.crypto.SecretKey;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtProvider {
    private static SecretKey secretKey = secretKey = Keys.hmacShaKeyFor(JwtConstant.secretKey.getBytes());

    public static String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String role =  populateAuthorities(authorities);
        String jwt = Jwts.builder()
                .setIssuedAt(new Date())
                .setExpiration(new Date(new Date().getTime() + 86400000)) // 1 day expiration
                .claim("email", auth.getName())
                .claim("authorities", role)
                .signWith(secretKey)
                .compact();
        return jwt;
    }

    public static String getEmailFromToken(String token) {
        token = token.substring(7);

        Claims claims = Jwts.parser()
                    .setSigningKey(secretKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

        String email = claims.get("email", String.class);
        return email;
    }

    private static String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
        Set<String> auth = new HashSet<String>();
        
        for (GrantedAuthority authority : authorities) {
            auth.add(authority.getAuthority());
        }

        return String.join(",", auth);
    }
}    
