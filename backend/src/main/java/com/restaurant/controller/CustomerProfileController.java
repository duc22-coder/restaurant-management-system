package com.restaurant.controller;

import com.restaurant.dto.request.UpdateProfileRequest;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.security.UserPrincipal;
import com.restaurant.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

// Lưu ý: nằm dưới /api/customer để dùng chung permitAll ở SecurityConfig,
// nhưng thực tế MỌI action ở đây đều bắt buộc phải có JWT hợp lệ (kiểm tra thủ công userPrincipal != null),
// vì Customer luôn phải đăng nhập mới có hồ sơ để xem/sửa.
@RestController
@RequestMapping("/api/customer/profile")
@RequiredArgsConstructor
public class CustomerProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserById(userPrincipal.getId()));
    }

    @PutMapping
    public ResponseEntity<UserResponse> updateMyProfile(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                                          @Valid @RequestBody UpdateProfileRequest request) {
        if (userPrincipal == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.updateOwnProfile(userPrincipal.getId(), request));
    }
}
