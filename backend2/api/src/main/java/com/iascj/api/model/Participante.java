package com.iascj.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "participantes")
public class Participante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Identificação (Folha 1) ---
    private String userType;
    private String userName;
    private String birthDate; // Recebe como String do input date do HTML
    private String gender;
    private String nis;
    private String birthCity;
    private String birthUF;
    private String address;
    private String rg;
    private String rgIssuer;
    private String rgUF;
    private String cpf;
    
    // Certidão
    private String birthCertificateNum;
    private String birthCertificateFolha;
    private String birthCertificateLivro;
    private String birthCertificateDate;

    // Responsáveis
    private String motherName;
    private String responsibleName;
    private String responsibleRG;
    private String responsibleRG_Issuer;
    private String responsibleRG_UF;
    private String responsibleCPF;
    private String responsibleNIS;

    // Escola
    private String schoolStatus;
    private String schoolStatusNegativeReason;
    private String schoolName;
    private String scholarity;
    private String schoolGrade;
    private String schoolTurn;
    private String attendsEJA;
    private String ejaSegment;
    private String ejaSemester;

    // Encaminhamentos e Benefícios (Listas de Strings)
    @ElementCollection
    private List<String> forwarding; // orgaoDemandante

    @ElementCollection
    private List<String> priorityAudience; // publicoPrioritario

    @ElementCollection
    private List<String> benefits;

    private String crasName;
    private String crasAddress;
    private String crasEmail;
    private String crasPhone;
    private String filledBy;

    // --- Contexto Social (Folha 2) ---
    private String registrationType;
    private String familyChief;
    private String familyReligion;
    private String workPlace;
    private String familyIncome;
    private String hasDisabledPerson;
    
    @ElementCollection
    private List<String> demographics; // Dados demograficos extras se houver
    
    private String useMedication;
    private String isAllergic;
    private String technicianResponsible;
    private String generalResponsible;
    private String contactPhone;

    // Lista de Familiares (Tabela aninhada)
    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "participante_id") // Cria chave estrangeira na tabela familiares
    private List<Familiar> familyMembers;
}