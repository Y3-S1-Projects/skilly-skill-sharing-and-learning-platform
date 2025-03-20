package com.example.skilly.Utils;

import com.example.skilly.Services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    @Autowired
    private JwtService jwtService;

    public String getUserIdFromToken(String token) {
        return jwtService.extractUserId(token);
    }

    public String getUserRoleFromToken(String token) {
        return jwtService.extractUserRole(token);
    }
}