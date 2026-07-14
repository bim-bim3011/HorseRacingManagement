package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.service.OtpService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OtpServiceImpl implements OtpService {

    StringRedisTemplate redisTemplate;

    // Thời gian sống của OTP (Ví dụ: 5 phút)
    private static final long OTP_EXPIRATION_MINUTES = 5;
    
    // Tiền tố cho key trong Redis để dễ quản lý
    private static final String OTP_PREFIX = "OTP_REGISTER:";

    @Override
    public void saveOtp(String email, String otp) {
        String key = OTP_PREFIX + email;
        // Lưu giá trị vào Redis và tự động xóa sau OTP_EXPIRATION_MINUTES phút
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(OTP_EXPIRATION_MINUTES));
    }

    @Override
    public boolean verifyOtp(String email, String otpInput) {
        String key = OTP_PREFIX + email;
        String savedOtp = redisTemplate.opsForValue().get(key);

        // Kiểm tra xem Redis có tồn tại mã OTP này không và có khớp không
        return savedOtp != null && savedOtp.equals(otpInput);
    }

    @Override
    public void clearOtp(String email) {
        String key = OTP_PREFIX + email;
        redisTemplate.delete(key);
    }
}
