package com.swp391.horseracing.module.common.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.swp391.horseracing.core.exception.AppException;
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
            
            // Xử lý trường hợp bị serialize 2 lần thành chuỗi JSON (GenericJackson2JsonRedisSerializer)
            if (jsonMessage.startsWith("\"") && jsonMessage.endsWith("\"")) {
                jsonMessage = objectMapper.readValue(jsonMessage, String.class);
            }
            
            Map<String, Object> notificationData = objectMapper.readValue(jsonMessage, Map.class);
            
            String username = String.valueOf(notificationData.get("username"));
            Object payload = notificationData.get("payload");


            // gui message nay qua websocket toi dung user (username)
            // kenh dich danh se la : /user/{username}/queue/notifications
            messagingTemplate.convertAndSendToUser(
                    username,
                    "/queue/notifications",
                    payload
            );
            

            log.info("Da gui websocket thanh cong toi User {} {}", username, payload);

        } catch (Exception e) {
            System.err.println("Lỗi khi xử lý Redis message: " + e.getMessage());
            log.error("Loi khi xu li Redis message  {}",e.getMessage());
        }
    }
}
