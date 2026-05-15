package com.wildguard.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // Allow your React app
public class AuthController {

    @Autowired
    private OtpService otpService;

    // STEP 1: Generate and "Send" OTP
    @PostMapping("/otp/generate")
    public String generate(@RequestBody AuthRequest request) {
        String otp = otpService.generateOtp(request.email());
        
        // For now, we print to console so you can see it without Mailgun setup
        System.out.println("DEBUG: OTP for " + request.email() + " is: " + otp);
        
        return "OTP sent to " + request.email();
    }

    // STEP 2: Verify OTP and Login
    @PostMapping("/otp/verify")
    public String verify(@RequestBody AuthRequest request) {
        boolean isValid = otpService.validateOtp(request.email(), request.otp());
        if (isValid) {
            return "Login Successful! Welcome, Guardian.";
        } else {
            throw new RuntimeException("Invalid or Expired OTP");
        }
    }
}