package com.iascj.api.repository;

import com.iascj.api.model.Participante;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParticipanteRepository extends JpaRepository<Participante, Long> {
}