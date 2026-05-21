package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.User;
import com.openclassrooms.testutils.UserTestBuilder;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(SpringExtension.class)
public class JwtServiceTest {

    private static final String LOGIN = "jdoe";
    private static final String TEST_JWT_SECRET_BASE64 = "VGhpc0lzQVRlc3RTZWNyZXRLZXlGb3JIVDI1NlRoaXNJc0xvbmdFbm91Z2hUb0JlVmFsaWQ=";
    private static final String OTHER_JWT_SECRET_BASE64 = "QW5vdGhlclRlc3RTZWNyZXRLZXlGb3JIVDI1NlRoYXRJc0Fsc29WYWxpZEtleTE=";
    private static final long DEFAULT_EXPIRATION = 3_600_000L;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = buildJwtService(TEST_JWT_SECRET_BASE64, DEFAULT_EXPIRATION);
    }

    // UT-JS-GEN-01 - test de la méthode generateToken avec un UserDetails valide
    @Test
    public void UtJsGen01_GenerateToken_ReturnsNonEmptyToken_ForValidUserDetails() {
        // GIVEN
        User user = UserTestBuilder.aUser().withLogin(LOGIN).build();

        // WHEN
        String token = jwtService.generateToken(user);

        // THEN
        assertThat(token).isNotBlank();
        assertThat(jwtService.getUsernameFromToken(token)).isEqualTo(LOGIN);
    }

    // UT-JS-GET-01 - test de la méthode getUsernameFromToken avec un token valide
    @Test
    public void UtJsGet01_GetUsernameFromToken_ReturnsUsername_ForValidToken() {
        // GIVEN
        User user = UserTestBuilder.aUser().withLogin(LOGIN).build();
        String token = jwtService.generateToken(user);

        // WHEN
        String username = jwtService.getUsernameFromToken(token);

        // THEN
        assertThat(username).isEqualTo(LOGIN);
    }

    // UT-JS-GET-02 - test de la méthode getUsernameFromToken avec un token invalide
    @Test
    public void UtJsGet02_GetUsernameFromToken_ThrowsJwtException_ForInvalidToken() {
        assertThatThrownBy(() -> jwtService.getUsernameFromToken("invalid-token"))
                .isInstanceOf(JwtException.class);
    }

    // UT-JS-VAL-01 - test de la méthode validateToken avec un token valide
    @Test
    public void UtJsVal01_ValidateToken_DoesNotThrow_ForValidToken() {
        // GIVEN
        User user = UserTestBuilder.aUser().withLogin(LOGIN).build();
        String token = jwtService.generateToken(user);

        // WHEN / THEN
        assertThatCode(() -> jwtService.validateToken(token)).doesNotThrowAnyException();
    }

    // UT-JS-VAL-02 - test de la méthode validateToken avec un token malformé
    @Test
    public void UtJsVal02_ValidateToken_ThrowsJwtException_ForMalformedToken() {
        assertThatThrownBy(() -> jwtService.validateToken("not-a-jwt"))
                .isInstanceOf(JwtException.class);
    }

    // UT-JS-VAL-03 - test de la méthode validateToken avec un token expiré
    @Test
    public void UtJsVal03_ValidateToken_ThrowsJwtException_ForExpiredToken() throws InterruptedException {
        // GIVEN
        JwtService shortLivedJwtService = buildJwtService(TEST_JWT_SECRET_BASE64, 1L);
        User user = UserTestBuilder.aUser().withLogin(LOGIN).build();
        String expiredToken = shortLivedJwtService.generateToken(user);
        Thread.sleep(10);

        // WHEN / THEN
        assertThatThrownBy(() -> jwtService.validateToken(expiredToken))
                .isInstanceOf(JwtException.class);
    }

    // UT-JS-VAL-04 - test de la méthode validateToken avec une signature invalide
    @Test
    public void UtJsVal04_ValidateToken_ThrowsJwtException_ForWrongSignature() {
        // GIVEN
        JwtService otherJwtService = buildJwtService(OTHER_JWT_SECRET_BASE64, DEFAULT_EXPIRATION);
        User user = UserTestBuilder.aUser().withLogin(LOGIN).build();
        String tokenSignedWithOtherKey = otherJwtService.generateToken(user);

        // WHEN / THEN
        assertThatThrownBy(() -> jwtService.validateToken(tokenSignedWithOtherKey))
                .isInstanceOf(JwtException.class);
    }

    // UT-JS-EXP-01 - test de la méthode getExpiration
    @Test
    public void UtJsExp01_GetExpiration_ReturnsConfiguredValue() {
        assertThat(jwtService.getExpiration()).isEqualTo(DEFAULT_EXPIRATION);
    }

    private JwtService buildJwtService(String secret, long expiration) {
        JwtService service = new JwtService();
        ReflectionTestUtils.setField(service, "jwtSecret", secret);
        ReflectionTestUtils.setField(service, "expiration", expiration);
        return service;
    }
}
