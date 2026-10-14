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
        rejectSeededDemoCredentials("admin", "admin123");
        rejectSeededDemoCredentials("staff", "staff123");
        if (!userRepository.findByRole(Role.ADMIN).isEmpty()) return;
        if (initialAdminUsername.isBlank() || initialAdminPassword.length() < 16
                || initialAdminPassword.startsWith("REPLACE_")) {
            throw new IllegalStateException("No ADMIN account exists. Set a one-time INITIAL_ADMIN_USERNAME and a unique INITIAL_ADMIN_PASSWORD (16+ characters), then remove them after startup.");
        }
        if (Boolean.TRUE.equals(userRepository.existsByUsername(initialAdminUsername))) {
            throw new IllegalStateException("The requested initial admin username already exists with another role.");
        }
        userRepository.save(User.builder()
                .username(initialAdminUsername.trim())
                .password(passwordEncoder.encode(initialAdminPassword))
                .fullName("System Administrator")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());
    }

    private void rejectSeededDemoCredentials(String username, String password) {
        userRepository.findByUsername(username).ifPresent(user -> {
            if (passwordEncoder.matches(password, user.getPassword())) {
                throw new IllegalStateException("A development demo account still exists in the production database. Reset its password before deployment.");
            }
        });
    }
}
