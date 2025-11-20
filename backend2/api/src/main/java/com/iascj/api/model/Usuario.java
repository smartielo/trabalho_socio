package com.iascj.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String cpf;

    private String nome;
    private String email;

    // AQUI ESTÁ A CORREÇÃO:
    // Dizemos que este campo 'senha' representa a coluna 'password_hash' do banco
    @Column(name = "password_hash", nullable = false) 
    private String senha; 
}