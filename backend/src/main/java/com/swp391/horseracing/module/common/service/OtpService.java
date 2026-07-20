package com.swp391.horseracing.module.common.service;

public interface OtpService {

    /**
     * Lưụ OTP vào Redis kèm thời gian hết hạn (5 phút)
     * @param email Địa chỉ email của người dùng (dùng làm key)
     * @param otp Mã OTP cần lưu (dùng làm value)
     */
    void saveOtp(String email, String otp);

    /**
     * Kiểm tra xem mã OTP do người dùng nhập có khớp với mã lưu trong Redis hay không
     * @param email Địa chỉ email của người dùng
     * @param otpInput Mã OTP do người dùng nhập vào
     * @return true nếu hợp lệ, false nếu sai hoặc đã hết hạn
     */
    boolean verifyOtp(String email, String otpInput);
    
    /**
     * Xóa OTP khỏi Redis (sau khi đã xác nhận thành công)
     * @param email Địa chỉ email của người dùng
     */
    void clearOtp(String email);
}
