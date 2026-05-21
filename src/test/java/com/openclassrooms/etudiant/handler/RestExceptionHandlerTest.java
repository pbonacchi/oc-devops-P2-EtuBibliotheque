package com.openclassrooms.etudiant.handler;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.nio.file.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;

public class RestExceptionHandlerTest {

    private static final String REQUEST_DESCRIPTION = "uri=/api/test";

    private RestExceptionHandler restExceptionHandler;
    private WebRequest webRequest;

    @BeforeEach
    void setUp() {
        restExceptionHandler = new RestExceptionHandler();
        MockHttpServletRequest servletRequest = new MockHttpServletRequest();
        servletRequest.setRequestURI("/api/test");
        webRequest = new ServletWebRequest(servletRequest);
    }

    // UT-REH-01 - JSON malformé
    @Test
    public void UtReh01_HandleHttpMessageNotReadable_ReturnsBadRequest_ForMalformedJson() {
        // GIVEN
        HttpMessageNotReadableException exception =
                new HttpMessageNotReadableException("JSON parse error", (Throwable) null);

        // WHEN
        ResponseEntity<Object> response = restExceptionHandler.handleHttpMessageNotReadable(
                exception, new HttpHeaders(), HttpStatus.BAD_REQUEST, webRequest);

        // THEN
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isInstanceOf(ErrorDetails.class);
        ErrorDetails errorDetails = (ErrorDetails) response.getBody();
        assertThat(errorDetails.getMessage()).isEqualTo("Malformed JSON request or invalid field types");
        assertThat(errorDetails.getTimestamp()).isNotNull();
        assertThat(errorDetails.getDetails()).contains("uri=/api/test");
    }

    // UT-REH-02 - identifiants invalides
    @Test
    public void UtReh02_HandleBadCredentialsException_ReturnsUnauthorized_ForInvalidCredentials() {
        // GIVEN
        String errorMessage = "Bad credentials";
        BadCredentialsException exception = new BadCredentialsException(errorMessage);

        // WHEN
        ResponseEntity<Object> response = restExceptionHandler.handleBadCredentialsException(exception, webRequest);

        // THEN
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isInstanceOf(ErrorDetails.class);
        ErrorDetails errorDetails = (ErrorDetails) response.getBody();
        assertThat(errorDetails.getMessage()).isEqualTo(errorMessage);
        assertThat(errorDetails.getTimestamp()).isNotNull();
        assertThat(errorDetails.getDetails()).contains("uri=/api/test");
    }

    // UT-REH-03 - accès refusé
    @Test
    public void UtReh03_HandleForbiddenException_ReturnsForbidden_ForAccessDenied() {
        // GIVEN
        String errorMessage = "Access is denied";
        AccessDeniedException exception = new AccessDeniedException(errorMessage);

        // WHEN
        ResponseEntity<Object> response = restExceptionHandler.handleForbiddenException(exception, webRequest);

        // THEN
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getBody()).isInstanceOf(ErrorDetails.class);
        ErrorDetails errorDetails = (ErrorDetails) response.getBody();
        assertThat(errorDetails.getMessage()).isEqualTo(errorMessage);
        assertThat(errorDetails.getTimestamp()).isNotNull();
        assertThat(errorDetails.getDetails()).contains("uri=/api/test");
    }

    // UT-REH-04 - erreur serveur non gérée
    @Test
    public void UtReh04_HandleException_ReturnsInternalServerError_ForUnexpectedException() {
        // GIVEN
        RuntimeException exception = new RuntimeException("Unexpected failure");

        // WHEN
        ResponseEntity<Object> response = restExceptionHandler.handleException(exception, webRequest);

        // THEN
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isEqualTo("Internal Server error");
    }
}
