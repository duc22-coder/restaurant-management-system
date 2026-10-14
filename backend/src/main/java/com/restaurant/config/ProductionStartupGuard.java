package com.restaurant.config;

import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class ProductionStartupGuard implements InitializingBean {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Value("${SITE_DOMAIN}")
    private String siteDomain;

    @Value("${CADDY_EMAIL}")
    private String caddyEmail;

    @Value("${BANK_ACCOUNT_NUMBER}")
    private String bankAccountNumber;

    @Override
    public void afterPropertiesSet() {
        if (jwtSecret.length() < 64 || jwtSecret.startsWith("REPLACE_")) {
            throw new IllegalStateException("Production JWT_SECRET must be a unique random value of at least 64 characters.");
        }
        if (databasePassword.length() < 24 || databasePassword.startsWith("REPLACE_")) {
            throw new IllegalStateException("Production MYSQL_PASSWORD must be a unique value of at least 24 characters.");
        }
        if (databaseUrl.contains("localhost") || databaseUrl.contains("restaurant_password")) {
            throw new IllegalStateException("Production datasource must point to the configured production database.");
        }
        if (allowedOrigins.isBlank() || allowedOrigins.contains("localhost") || allowedOrigins.contains("REPLACE_")) {
            throw new IllegalStateException("Production CORS must contain the public HTTPS site origin.");
        }
        if (siteDomain.isBlank() || siteDomain.endsWith("example.com") || caddyEmail.endsWith("example.com")) {
            throw new IllegalStateException("Set SITE_DOMAIN and CADDY_EMAIL to real production values.");
        }
        if (bankAccountNumber.isBlank() || bankAccountNumber.startsWith("REPLACE_")) {
            throw new IllegalStateException("Set the real bank account before enabling production QR payments.");
        }
        for (String origin : allowedOrigins.split(",")) {
            if (!origin.trim().startsWith("https://")) {
                throw new IllegalStateException("Every production CORS origin must use HTTPS.");
            }
        }
    }
}
