package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.etudiant.repository.UserRepository;
import com.openclassrooms.testutils.UserTestBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CustomUserDetailServiceTest {

    private static final String LOGIN = "jdoe";
    private static final String PASSWORD = "encoded-password";

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserDetailService customUserDetailService;

    // UT-CUDS-01 - utilisateur trouvé en base
    @Test
    public void UtCuds01_LoadUserByUsername_ReturnsUserDetails_ForExistingLogin() {
        // GIVEN
        User user = UserTestBuilder.aUser().withLogin(LOGIN).withPassword(PASSWORD).build();
        when(userRepository.findByLogin(LOGIN)).thenReturn(Optional.of(user));

        // WHEN
        UserDetails userDetails = customUserDetailService.loadUserByUsername(LOGIN);

        // THEN
        verify(userRepository).findByLogin(LOGIN);
        assertThat(userDetails).isSameAs(user);
        assertThat(userDetails.getUsername()).isEqualTo(LOGIN);
        assertThat(userDetails.getPassword()).isEqualTo(PASSWORD);
        assertThat(userDetails.getAuthorities()).isEmpty();
        assertThat(userDetails.isEnabled()).isTrue();
        assertThat(userDetails.isAccountNonExpired()).isTrue();
        assertThat(userDetails.isAccountNonLocked()).isTrue();
        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
    }

    // UT-CUDS-02 - utilisateur absent en base
    @Test
    public void UtCuds02_LoadUserByUsername_ThrowsUsernameNotFoundException_ForUnknownLogin() {
        // GIVEN
        String unknownLogin = "unknown.login";
        when(userRepository.findByLogin(unknownLogin)).thenReturn(Optional.empty());

        // WHEN / THEN
        assertThatThrownBy(() -> customUserDetailService.loadUserByUsername(unknownLogin))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User Not Found with username: " + unknownLogin);

        verify(userRepository).findByLogin(unknownLogin);
    }
}
