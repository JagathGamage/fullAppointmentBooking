package org.example.appointmentbooking.services;

import org.example.appointmentbooking.dto.AuthRequest;
import org.example.appointmentbooking.dto.AuthResponse;
import org.example.appointmentbooking.models.Role;
import org.example.appointmentbooking.models.User;
import org.example.appointmentbooking.repository.UserRepository;
import org.example.appointmentbooking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public ResponseEntity<?> registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists!");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 🟢 Assign default role USER if not provided
        if (user.getRole() == null) {
            user.setRole(Role.USER);
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully!");
    }

    public ResponseEntity<?> loginUser(AuthRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid credentials!");
        }

        User user = optionalUser.get();

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials!");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        // 🟢 Include role in response
        return ResponseEntity.ok(new AuthResponse(token, user.getEmail(), user.getRole()));
    }
}
