package com.swp391.horseracing.module.user.repository;

import com.swp391.horseracing.module.user.entity.User;
import com.swp391.horseracing.module.auth.entity.Role;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filterUsers(String keyword, String status, Integer roleId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String searchPattern = "%" + keyword.toLowerCase() + "%";
                Predicate usernameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("username")), searchPattern);
                Predicate emailLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), searchPattern);
                predicates.add(criteriaBuilder.or(usernameLike, emailLike));
            }

            if (status != null && !status.trim().isEmpty()) {
                try {
                    User.UserStatus userStatus = User.UserStatus.valueOf(status.toLowerCase());
                    predicates.add(criteriaBuilder.equal(root.get("status"), userStatus));
                } catch (IllegalArgumentException e) {
                    // Ignore invalid status
                }
            }

            if (roleId != null) {
                Join<User, Role> rolesJoin = root.join("roles");
                predicates.add(criteriaBuilder.equal(rolesJoin.get("id"), roleId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
