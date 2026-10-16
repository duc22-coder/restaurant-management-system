package com.restaurant.config;

import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.enums.UserStatus;
import com.restaurant.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
@RequiredArgsConstructor
public class ProductionAdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${INITIAL_ADMIN_USERNAME:}")
    private String initialAdminUsername;

    @Value("${INITIAL_ADMIN_PASSWORD:}")
    private String initialAdminPassword;

    @Override
    public void run(String... args) {
        disableSeededDemoCredentials("admin", "admin123");
        disableSeededDemoCredentials("staff", "staff123");

        boolean hasActiveAdmin = userRepository.findByRole(Role.ADMIN).stream()
                .anyMatch(user -> user.getStatus() == UserStatus.ACTIVE);
        if (hasActiveAdmin) return;

        if (initialAdminUsername.isBlank() || initialAdminPassword.length() < 16
                || initialAdminPassword.startsWith("REPLACE_")) {
            throw new IllegalStateException("No active ADMIN account exists. Set INITIAL_ADMIN_USERNAME and a unique INITIAL_ADMIN_PASSWORD (16+ characters).");
        }

        String username = initialAdminUsername.trim();
        User existingUser = userRepository.findByUsername(username).orElse(null);
        if (existingUser != null) {
            if (existingUser.getRole() != Role.ADMIN) {
                throw new IllegalStateException("The requested initial admin username already exists with another role.");
            }
            existingUser.setPassword(passwordEncoder.encode(initialAdminPassword));
            existingUser.setStatus(UserStatus.ACTIVE);
            userRepository.save(existingUser);
            return;
        }

        userRepository.save(User.builder()
                .username(username)
                .password(passwordEncoder.encode(initialAdminPassword))
                .fullName("System Administrator")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
    }

    private void disableSeededDemoCredentials(String username, String password) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (passwordEncoder.matches(password, user.getPassword())) {
                user.setStatus(UserStatus.INACTIVE);
                userRepository.save(user);
            }
        });
    }
}
