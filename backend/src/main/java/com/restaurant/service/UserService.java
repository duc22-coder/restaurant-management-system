package com.restaurant.service;

import com.restaurant.dto.request.UpdateProfileRequest;
import com.restaurant.dto.request.UserRequest;
import com.restaurant.dto.response.UserResponse;
import com.restaurant.enums.Role;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers(Role role);
    UserResponse getUserById(Long id);
    UserResponse createUser(UserRequest request);
    UserResponse updateUser(Long id, UserRequest request);
    UserResponse updateOwnProfile(Long id, UpdateProfileRequest request);
    UserResponse toggleUserStatus(Long id);
    void deleteUser(Long id);
}
