package com.example.skilly.Config;

import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("localhost");
        config.setPort(8081); // Different port or same as your Spring app
        config.setContext("/socket.io");

        // CORS setup
        config.setOrigin("*");

        // Optional - for better debugging
        config.setRandomSession(false);

        return new SocketIOServer(config);
    }
}