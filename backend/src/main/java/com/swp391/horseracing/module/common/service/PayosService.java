package com.swp391.horseracing.module.common.service;

import com.swp391.horseracing.module.common.dto.request.PayosCreateRequest;
import com.swp391.horseracing.module.common.dto.response.PayosCreateResponse;

public interface PayosService {

    /**
     * Tạo link thanh toán PayOS (mã QR VietQR).
     * User đã đăng nhập gọi API này để bắt đầu nạp tiền.
     */
    PayosCreateResponse createPaymentLink(PayosCreateRequest request);

    /**
     * Xử lý webhook từ PayOS gọi ngầm khi giao dịch thành công.
     * Verify chữ ký → Tìm đơn hàng → Cộng tiền vào ví.
     */
    void handleWebhook(String jsonBody) throws Exception;

    /**
     * Đăng ký Webhook URL với PayOS (chỉ cần gọi 1 lần).
     */
    void confirmWebhook(String webhookUrl) throws Exception;
}
