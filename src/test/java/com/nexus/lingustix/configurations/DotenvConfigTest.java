package com.nexus.lingustix.configurations;

import io.github.cdimascio.dotenv.Dotenv;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DotenvConfigTest {

    @BeforeEach
    void setup() {
        // Clear any previously set properties
        System.clearProperty("APP_JWT_SECRET");
        System.clearProperty("TEST_CUSTOM_PROPERTY");
    }

    @Test
    void loadDotenv_loadsPropertiesFromTestEnvFile() {
        // Load from test .env file
        Dotenv dotenv = Dotenv.configure()
                .directory("src/test/resources")
                .filename(".env.test")
                .load();

        // Set properties as the config would
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });

        // Verify properties are loaded
        assertThat(System.getProperty("APP_JWT_SECRET")).isNotNull();
        assertThat(System.getProperty("TEST_CUSTOM_PROPERTY")).isEqualTo("custom_test_value");
    }

    @Test
    void validateRequiredEnvironmentVariables_passesWithValidSecret() {
        // Set a valid Base64 secret (at least 32 bytes when decoded)
        String validSecret = "dGVzdC1zZWNyZXQta2V5LWZvci11bml0LXRlc3RpbmctMTIzNDU2Nzg5MA==";
        System.setProperty("APP_JWT_SECRET", validSecret);

        DotenvConfig config = new DotenvConfig();

        // Should not throw
        config.validateRequiredEnvironmentVariables();
    }

    @Test
    void validateRequiredEnvironmentVariables_throwsWhenSecretIsMissing() {
        // Don't set any secret
        DotenvConfig config = new DotenvConfig();

        assertThatThrownBy(config::validateRequiredEnvironmentVariables)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("APP_JWT_SECRET is missing");
    }

    @Test
    void validateRequiredEnvironmentVariables_throwsWhenSecretIsTooShort() {
        // Set a Base64 secret that's too short (less than 32 bytes when decoded)
        String shortSecret = "c2hvcnQ="; // "short" in Base64, only 5 bytes
        System.setProperty("APP_JWT_SECRET", shortSecret);

        DotenvConfig config = new DotenvConfig();

        assertThatThrownBy(config::validateRequiredEnvironmentVariables)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 256 bits");
    }

    @Test
    void validateRequiredEnvironmentVariables_throwsWhenSecretIsNotValidBase64() {
        // Set an invalid Base64 string
        String invalidSecret = "not-valid-base64!!!@@@";
        System.setProperty("APP_JWT_SECRET", invalidSecret);

        DotenvConfig config = new DotenvConfig();

        assertThatThrownBy(config::validateRequiredEnvironmentVariables)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("valid Base64");
    }
}
