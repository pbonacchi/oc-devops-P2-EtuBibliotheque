package com.openclassrooms.etudiant.configuration.security;

import com.openclassrooms.etudiant.service.JwtService;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.IOException;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class JwtAuthenticationFilterTest {

    private static final String RAW_TOKEN = "token.part1.part2";
    private static final String LOGIN = "jdoe";

    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailService customUserDetailService;
    @Mock
    private jakarta.servlet.FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // UT-JAF-DFI-01 - token Bearer valide : authentification injectée dans le SecurityContext
    @Test
    public void UtJafDfi01_DoFilterInternal_SetsAuthentication_ForValidBearerToken() throws ServletException, IOException {
        // GIVEN
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + RAW_TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();
        UserDetails userDetails = new User(LOGIN, "encoded-password", List.of());

        when(jwtService.getUsernameFromToken(RAW_TOKEN)).thenReturn(LOGIN);
        when(customUserDetailService.loadUserByUsername(LOGIN)).thenReturn(userDetails);

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN
        verify(jwtService).validateToken(RAW_TOKEN);
        verify(jwtService).getUsernameFromToken(RAW_TOKEN);
        verify(customUserDetailService).loadUserByUsername(LOGIN);
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNotNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication().getName()).isEqualTo(LOGIN);
    }

    // UT-JAF-DFI-02 - header Authorization absent : pas d'appel JWT
    @Test
    public void UtJafDfi02_DoFilterInternal_DoesNotAuthenticate_WhenAuthorizationHeaderMissing() throws ServletException, IOException {
        // GIVEN
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN
        verify(jwtService, never()).validateToken(org.mockito.ArgumentMatchers.anyString());
        verify(jwtService, never()).getUsernameFromToken(org.mockito.ArgumentMatchers.anyString());
        verify(customUserDetailService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.anyString());
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // UT-JAF-EXT-01 - header non Bearer : branche extractJwtFromRequest retourne null
    @Test
    public void UtJafExt01_DoFilterInternal_DoesNotAuthenticate_WhenAuthorizationHeaderIsNotBearer() throws ServletException, IOException {
        // GIVEN
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic abcdef");
        MockHttpServletResponse response = new MockHttpServletResponse();

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN
        verify(jwtService, never()).validateToken(org.mockito.ArgumentMatchers.anyString());
        verify(jwtService, never()).getUsernameFromToken(org.mockito.ArgumentMatchers.anyString());
        verify(customUserDetailService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.anyString());
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }

    // UT-JAF-DFI-03 - token invalide : exception absorbée et chaîne poursuivie
    @Test
    public void UtJafDfi03_DoFilterInternal_ContinuesFilterChain_WhenJwtValidationThrowsException() throws ServletException, IOException {
        // GIVEN
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + RAW_TOKEN);
        MockHttpServletResponse response = new MockHttpServletResponse();

        doThrow(new RuntimeException("invalid token")).when(jwtService).validateToken(RAW_TOKEN);

        // WHEN
        jwtAuthenticationFilter.doFilter(request, response, filterChain);

        // THEN
        verify(jwtService).validateToken(RAW_TOKEN);
        verify(jwtService, never()).getUsernameFromToken(org.mockito.ArgumentMatchers.anyString());
        verify(customUserDetailService, never()).loadUserByUsername(org.mockito.ArgumentMatchers.anyString());
        verify(filterChain).doFilter(request, response);
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
    }
}
