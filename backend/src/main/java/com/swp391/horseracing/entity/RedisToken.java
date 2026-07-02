package com.swp391.horseracing.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import org.springframework.data.redis.core.TimeToLive;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor @Builder
@RedisHash("RedisToken")
public class RedisToken {

    @Id
    String jwtId;
    @TimeToLive
    Long expiredTime;


}
