package com.restaurant.dto.response;

import com.restaurant.enums.Role;
import com.restaurant.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
