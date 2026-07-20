package com.swp391.horseracing.module.auth.repository;

import com.swp391.horseracing.module.auth.entity.RedisToken;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RedisTokenRepository extends CrudRepository<RedisToken, String>{

}
