package com.designaciones.webdesignaciones.model;

import com.designaciones.webdesignaciones.enums.Categoria;
import com.designaciones.webdesignaciones.enums.CategoriaArbitro;
import com.designaciones.webdesignaciones.enums.RolUsuario;
import jakarta.persistence.*;
import jdk.jfr.DataAmount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Arbitro {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idArbitro;
    private String nombre;
    private String apellido;
    @Column(unique = true)
    private String whatsapp;
    private Boolean disponibleSabado;
    private Boolean disponibleDomingo;
    private Boolean estadoSistema;
    private String talleShort, talleCamiseta;
    @Enumerated(EnumType.STRING)
    private CategoriaArbitro categoria;
    private Boolean tieneAuto;
    @Column(nullable = false)
    private String contrasenia;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "arbitro_roles", joinColumns = @JoinColumn(name = "id_arbitro"))
    @Enumerated(EnumType.STRING)
    @Column(name = "rol", nullable = false)
    @Builder.Default
    private Set<RolUsuario> roles = new HashSet<>(java.util.Set.of(RolUsuario.ARBITRO));

    @OneToMany(mappedBy = "arbitro", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Designados> designaciones = new HashSet<>();

    @OneToMany(mappedBy = "arbitro", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Suspencion> suspenciones = new HashSet<>();

    public Set<RolUsuario> getRoles() {
        if (this.roles == null || this.roles.isEmpty()) {
            Set<RolUsuario> defaultRoles = new HashSet<>();
            defaultRoles.add(RolUsuario.ARBITRO);
            return defaultRoles;
        }
        return this.roles;
    }

    public boolean tieneRol(RolUsuario rol) {
        return getRoles().contains(rol);
    }

    public void agregarRol(RolUsuario rol) {
        if (this.roles == null || this.roles.isEmpty()) {
            this.roles = new HashSet<>(java.util.Set.of(RolUsuario.ARBITRO));
        }
        this.roles.add(rol);
    }

    public void quitarRol(RolUsuario rol) {
        if (this.roles != null) {
            this.roles.remove(rol);
        }
    }

    public Arbitro(String apellido, String nombre, String talleCamiseta, String talleShort) {
        this.apellido = apellido;
        this.nombre = nombre;
        this.talleCamiseta = talleCamiseta;
        this.talleShort = talleShort;
        this.estadoSistema = true;
        this.disponibleSabado = false;
        this.disponibleDomingo = false;
    }

    public Arbitro(String apellido, String nombre, String talleCamiseta, String talleShort, String whatsapp) {
        this.apellido = apellido;
        this.nombre = nombre;
        this.talleCamiseta = talleCamiseta;
        this.talleShort = talleShort;
        this.whatsapp = whatsapp;
        this.estadoSistema = true;
        this.disponibleSabado = false;
        this.disponibleDomingo = false;
    }

    public String getNombreCompleto() {
        return this.apellido + " " + this.nombre;
    }
}
