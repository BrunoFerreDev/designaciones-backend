package com.designaciones.webdesignaciones.security;

import com.designaciones.webdesignaciones.dto.get.AuthResponseDTO;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.record.AuthLogin;
import com.designaciones.webdesignaciones.record.AuthResponse;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailServiceImpl implements UserDetailsService {
    private final ArbitroRepository arbitroRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    @Value("${security.jwt.private.user.phone}")
    private String phone;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Arbitro arbitro = arbitroRepository.findByWhatsapp(username);
        if (arbitro == null) {
            throw new UsernameNotFoundException("Usuario no encontrado");
        }
        if (phone == null || !arbitro.getWhatsapp().equalsIgnoreCase(phone)) {
            throw new UsernameNotFoundException("Usuario no autorizado");
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
        return new User(arbitro.getWhatsapp(), arbitro.getContrasenia(), true, true, true, true, authorities);
    }

    public Authentication authenticate(String username, String password) {
        UserDetails userDetails = this.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username or password");
        }
        // si no es igual
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(), userDetails.getPassword(), userDetails.getAuthorities());
    }

    public AuthResponse loginUser(AuthLogin loginDTO) {
        //Obtener usuario y contrasena
        String password = loginDTO.contrasenia();
        String whatsapp = loginDTO.whatsapp();
        Authentication authentication = this.authenticate(whatsapp, loginDTO.contrasenia());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String rol = authentication.getAuthorities().iterator().next().getAuthority().toString().replace("ROLE_", "");
        String tokenAcceso = jwtUtils.crearToken(authentication, whatsapp);
        AuthResponse authResponse = new AuthResponse(whatsapp, "login ok", tokenAcceso, true);
        return authResponse;
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }
}
