package com.example.skilly.Config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.SocketConfig;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SocketIOConfig {

    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname("localhost");
        config.setPort(8081);
        config.setContext("/socket.io");

        // CORS setup
        config.setOrigin("http://localhost:5173");

        // Enable compatibility with Socket.IO v4+ clients
        config.setUpgradeTimeout(20000);
        config.setPingTimeout(60000);
        config.setPingInterval(25000);

        // Configure Socket settings
        SocketConfig socketConfig = new SocketConfig();
        socketConfig.setReuseAddress(true);
        config.setSocketConfig(socketConfig);

        // Optional - for better debugging
        config.setRandomSession(false);

        return new SocketIOServer(config);
    }
}