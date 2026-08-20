package com.restaurant.service;

import com.restaurant.dto.request.LoginRequest;
import com.restaurant.dto.response.AuthResponse;
import com.restaurant.dto.response.UserResponse;

public interface AuthService {

    AuthResponse login(LoginRequest loginRequest);

    UserResponse getCurrentUser(String username);
}
