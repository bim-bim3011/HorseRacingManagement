package com.swp391.horseracing.module.user.entity;

import com.swp391.horseracing.core.common.entity.BaseEntity;
import com.swp391.horseracing.module.auth.entity.Role;
import com.swp391.horseracing.module.betting.entity.betting.Bet;
import com.swp391.horseracing.module.common.entity.betting.VnpayDeposit;
import com.swp391.horseracing.module.common.entity.betting.Wallet;
import com.swp391.horseracing.module.notification.entity.Notification;
import com.swp391.horseracing.module.payment.entity.betting.WithdrawalRequest;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@Entity
@Table(name = "users")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseEntity implements UserDetails {

    @Size(max = 50)
    @NotNull
    @Column(name = "username", nullable = false, length = 50)
    String username;

    @Size(max = 255)

    @Column(name = "password_hash", nullable = false)
    String passwordHash;

    @Size(max = 100)
    @NotNull
    @Column(name = "email", nullable = false, length = 100)
    String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    UserStatus status = UserStatus.active;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles", joinColumns = { @JoinColumn(name = "user_id") }, inverseJoinColumns = {
            @JoinColumn(name = "role_id") })
    Set<Role> roles = new LinkedHashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Wallet wallet;

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    private List<Bet> bets;

    @OneToMany(mappedBy = "user")
    private List<VnpayDeposit> vnpayDeposits;

    @OneToMany(mappedBy = "user")
    private List<WithdrawalRequest> withdrawalRequests;

    @Override
    public @Nullable String getPassword() {
        return this.getPasswordHash();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }

    public enum UserStatus {
        active, inactive, banned
    }

}