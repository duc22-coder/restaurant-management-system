package com.restaurant.dto.request;

import com.restaurant.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {

    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    // Bắt buộc khi tạo mới; khi cập nhật có thể để trống để giữ nguyên mật khẩu cũ
    private String password;

    @NotBlank(message = "Họ tên không được để trống")
    private String fullName;

    @Email(message = "Email không đúng định dạng")
    private String email;

    private String phone;

    @NotNull(message = "Vai trò không được để trống")
    private Role role;
}
