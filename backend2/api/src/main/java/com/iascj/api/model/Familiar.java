package com.iascj.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "familiares")
public class Familiar {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Campos iguais ao familyMembers do React
    private String nome;
    private String parentesco;
    private String idade;
}