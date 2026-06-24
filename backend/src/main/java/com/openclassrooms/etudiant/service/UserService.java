package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Optional;

import com.openclassrooms.etudiant.dto.UpdateStudentDTO;
import com.openclassrooms.etudiant.mapper.UserDtoMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${DEFAULT_PASSWORD}")
    private String defaultPassword;

    @Transactional(readOnly = true)
    public String login(String login, String password) {
        Assert.notNull(login, "Login must not be null");
        Assert.notNull(password, "Password must not be null");
        Optional<User> user = userRepository.findByLogin(login);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                    .username(login).password(user.get().getPassword()).build();
            return jwtService.generateToken(userDetails);
        } else {
            throw new IllegalArgumentException("Invalid credentials");
        }
    }

    //= CREATE - auto enregistrement d'un étudiant
    @Transactional
    public void register(User user) {
        Assert.notNull(user, "User must not be null");
        log.info("Registering new user");

        Optional<User> optionalUser = userRepository.findByLogin(user.getLogin());
        if (optionalUser.isPresent()) {
            throw new IllegalArgumentException("User with login " + user.getLogin() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    //= CREATE - enregistrement d'un étudiant par un admin
    @Transactional
    public User createStudent(User user) {
        Assert.notNull(user, "User must not be null");
        log.info("Creating new student");

        Optional<User> optionalUser = userRepository.findByLogin(user.getLogin());
        if (optionalUser.isPresent()) {
            throw new IllegalArgumentException("User with login " + user.getLogin() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(defaultPassword));
        return userRepository.save(user);
    }

    //= READ - récupérer tous les étudiants
    @Transactional(readOnly = true)
    public List<User> getAllStudents() {
        log.info("Fetching all students");
        return userRepository.findAll();
    }

    //= READ - récupérer un étudiant par id
    @Transactional(readOnly = true)
    public User getStudentById(Long id) {
        log.info("Fetching student with id {}", id);
        return userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User with id " + id + " does not exist"));
    }

    //= UPDATE
    @Transactional
    public void updateStudentById(Long id, UpdateStudentDTO updateStudentDTO, UserDtoMapper mapper) {
        Assert.notNull(updateStudentDTO, "Update data must not be null");
        log.info("Updating student with id {}", id);

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + id + " does not exist"));
        mapper.updateFromDto(updateStudentDTO, existingUser);
        userRepository.save(existingUser);
    }

    //= DELETE
    @Transactional
    public void deleteStudentById(Long id) {
        log.info("Deleting student with id {}", id);
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
        userRepository.deleteById(id);
    }

}