package com.restaurant.dto.response;

import com.restaurant.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String accessToken;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long id;
    private String username;
    private String fullName;
    private Role role;
}
