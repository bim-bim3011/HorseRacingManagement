package com.swp391.horseracing.module.common.service;

import jakarta.mail.MessagingException;
import org.springframework.web.multipart.MultipartFile;

public interface EmailService {

    public String sendEmail(String recipients , String subject,
                            String content, MultipartFile... file ) throws MessagingException;
                            
    String generateOTP();
    
    void sendOtpEmail(String toEmail, String otp);
}
