package com.swp391.horseracing.service.impl;

import com.swp391.horseracing.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Random;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
@Slf4j
public class EmailServiceImpl implements EmailService {


     JavaMailSender mailSender;
     TemplateEngine templateEngine;


    @Override
    public String sendEmail(String recipients, String subject, String content, MultipartFile... file) throws MessagingException {
        log.info("Sending ....");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message,true,"UTF-8");



        return "";
    }

    @Override
    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); 
        return String.valueOf(otp);
    }

    @Override
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Mã OTP Xác nhận đăng ký tài khoản - Horse Racing");

            Context context = new Context();
            context.setVariable("otp", otp); 

            String htmlContent = templateEngine.process("otp-email", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("OTP email sent successfully to {}", toEmail);

        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email OTP", e);
        }
    }
}
