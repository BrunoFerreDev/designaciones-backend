package com.designaciones.webdesignaciones.security;

import com.designaciones.webdesignaciones.enums.RolUsuario;
import com.designaciones.webdesignaciones.model.Arbitro;
import com.designaciones.webdesignaciones.record.AuthLogin;
import com.designaciones.webdesignaciones.record.AuthResponse;
import com.designaciones.webdesignaciones.repository.ArbitroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
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
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserDetailServiceImpl implements UserDetailsService {
    private final ArbitroRepository arbitroRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Value("${JWT_PHONE:}")
    private String phone;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Arbitro arbitro = arbitroRepository.findByWhatsapp(username);
        if (arbitro == null) {
            throw new UsernameNotFoundException("Usuario no encontrado con whatsapp: " + username);
        }
        if (!Boolean.TRUE.equals(arbitro.getEstadoSistema())) {
            throw new DisabledException("Usuario inactivo o no autorizado en el sistema");
        }

        Set<RolUsuario> roles = arbitro.getRoles();
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (RolUsuario r : roles) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + r.name()));
        }

        // Si es SUPERUSER o coincide con el teléfono admin de bootstrap, otorgar todas las autoridades
        boolean esAdminBootstrap = phone != null && !phone.isBlank() && arbitro.getWhatsapp().equalsIgnoreCase(phone.trim());
        if (roles.contains(RolUsuario.SUPERUSER) || esAdminBootstrap) {
            authorities.add(new SimpleGrantedAuthority("ROLE_SUPERUSER"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
            authorities.add(new SimpleGrantedAuthority("ROLE_PRESIDENTE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_SECRETARIO"));
            authorities.add(new SimpleGrantedAuthority("ROLE_DESIGNADOR"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ARBITRO"));
        }

        return new User(arbitro.getWhatsapp(), arbitro.getContrasenia(), true, true, true, true, authorities);
    }

    public Authentication authenticate(String username, String password) {
        UserDetails userDetails = this.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Credenciales inválidas");
        }
        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Contraseña incorrecta");
        }
        return new UsernamePasswordAuthenticationToken(userDetails.getUsername(), userDetails.getPassword(), userDetails.getAuthorities());
    }

    public AuthResponse loginUser(AuthLogin loginDTO) {
        String whatsapp = loginDTO.whatsapp();
        Authentication authentication = this.authenticate(whatsapp, loginDTO.contrasenia());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Arbitro arbitro = arbitroRepository.findByWhatsapp(whatsapp);
        Set<String> roles = arbitro.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toSet());

        String tokenAcceso = jwtUtils.crearToken(authentication, whatsapp);
        return new AuthResponse(
                whatsapp,
                "login ok",
                tokenAcceso,
                true,
                roles,
                arbitro.getIdArbitro(),
                arbitro.getNombreCompleto()
        );
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }
}
