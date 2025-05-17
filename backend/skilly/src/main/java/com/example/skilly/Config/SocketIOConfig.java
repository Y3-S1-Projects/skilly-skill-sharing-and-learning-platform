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
        config.setHostname("0.0.0.0"); // Allow all interfaces
        config.setPort(8081);

        // Leave the context path as default
        // config.setContext("/socket.io"); - Remove this line

        // Explicit CORS setup
        config.setOrigin("*");

        // Increase timeouts for better connection reliability
        config.setUpgradeTimeout(30000); // 30 seconds
        config.setPingTimeout(60000); // 60 seconds
        config.setPingInterval(25000); // 25 seconds

        // Socket configuration
        SocketConfig socketConfig = new SocketConfig();
        socketConfig.setReuseAddress(true);
        socketConfig.setTcpNoDelay(true);
        socketConfig.setSoLinger(0); // Don't linger on close
        config.setSocketConfig(socketConfig);

        // Additional reliability settings
        config.setRandomSession(false);
        config.setAllowCustomRequests(true);

        // Add transport mode compatibility for older clients
        config.setTransports(com.corundumstudio.socketio.Transport.WEBSOCKET,
                com.corundumstudio.socketio.Transport.POLLING);

        // Set a clean session timeout (in seconds)
        config.setFirstDataTimeout(10);

        return new SocketIOServer(config);
    }
}