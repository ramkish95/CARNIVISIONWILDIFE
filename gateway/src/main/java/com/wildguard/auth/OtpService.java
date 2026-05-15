package com.wildguard.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final String OTP_PREFIX = "guardian_otp:";

    public String generateOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        // Store in Redis for 5 minutes
        redisTemplate.opsForValue().set(OTP_PREFIX + email, otp, 5, TimeUnit.MINUTES);
        return otp;
    }

    public boolean validateOtp(String email, String userOtp) {
        String cachedOtp = redisTemplate.opsForValue().get(OTP_PREFIX + email);
        return userOtp.equals(cachedOtp);
    }
}