package com.swp391.horseracing.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.horseracing.exception.AppException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class RedisMessageSubscriber implements MessageListener {

    SimpMessagingTemplate messagingTemplate;

     ObjectMapper objectMapper;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {

            // Doc message tu redis (gia su minh gui json co chua userId vaf content)
            String jsonMessage = new String(message.getBody());
            Map<String, Object> notificationData = objectMapper.readValue(jsonMessage, Map.class);
            
            String userId = String.valueOf(notificationData.get("userId"));
            Object payload = notificationData.get("payload");


            // gui message nay qua websocket toi dung user
            // kenh dich danh se la : /user/{userId}/queue/notifications
            messagingTemplate.convertAndSendToUser(
                    userId,
                    "/queue/notifications",
                    payload
            );
            

            log.info("Da gui websocket thanh cong toi User {} {}", userId, payload);

        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý Redis message: " + e.getMessage());
            log.error("Loi khi xu li Redis message  {}",e.getMessage());
        }
    }
}
