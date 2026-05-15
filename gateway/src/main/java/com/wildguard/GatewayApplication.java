package com.wildguard;

// This is the correct import for the GraphHopper dependency
import com.bedatadriven.jackson.datatype.jts.JtsModule; 
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }

    @Bean
    public JtsModule jtsModule() {
        return new JtsModule();
    }
}