package com.nexus.lingustix.configurations;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

import java.util.Base64;

@Configuration
public class DotenvConfig {

    private static final Logger logger = LoggerFactory.getLogger(DotenvConfig.class);

    static {
        loadDotenvIntoSystemProperties();
    }

    private static void loadDotenvIntoSystemProperties() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                // Only set if not already set as system property (command line takes precedence)
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });

            logger.info("Loaded .env file into system properties");
        } catch (Exception e) {
            logger.warn("Could not load .env file: {}", e.getMessage());
        }
    }

    /**
     * Gets a configuration value with the following priority:
     * 1. System property (command line or .env file)
     * 2. Environment variable
     */
    private static String getConfigValue(String key) {
        String value = System.getProperty(key);
        if (value == null) {
            value = System.getenv(key);
            // Also set as system property for consistency across the application
            if (value != null) {
                System.setProperty(key, value);
            }
        }
        return value;
    }

    @PostConstruct
    public void validateRequiredEnvironmentVariables() {
        String jwtSecret = getConfigValue("APP_JWT_SECRET");

        if (jwtSecret == null || jwtSecret.isBlank()) {
            logger.error("Required environment variable APP_JWT_SECRET is missing. " +
                    "Please set it in your .env file or as an environment variable.");
            throw new IllegalStateException("Required environment variable APP_JWT_SECRET is missing");
        }

        // Validate that the secret is a valid Base64 string with at least 256 bits (32 bytes)
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(jwtSecret);
            if (decodedBytes.length < 32) {
                logger.error("APP_JWT_SECRET must be a Base64 encoded string of at least 256 bits (32 bytes)");
                throw new IllegalStateException("APP_JWT_SECRET must be at least 256 bits (32 bytes) when decoded");
            }
            logger.info("APP_JWT_SECRET validation passed");
        } catch (IllegalArgumentException e) {
            logger.error("APP_JWT_SECRET is not a valid Base64 encoded string: {}", e.getMessage());
            throw new IllegalStateException("APP_JWT_SECRET must be a valid Base64 encoded string", e);
        }
    }
}
