package com.iascj.api.controller;

import com.iascj.api.model.Participante;
import com.iascj.api.repository.ParticipanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/participantes")
@CrossOrigin(origins = "http://localhost:3000")
public class ParticipanteController {

    @Autowired
    private ParticipanteRepository repository;

    // Recebe o JSON do formulário e salva tudo
    @PostMapping
    public ResponseEntity<?> criar(@RequestBody Participante participante) {
        try {
            Participante salvo = repository.save(participante);
            return ResponseEntity.status(201).body(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao salvar: " + e.getMessage());
        }
    }

    // Lista para o Dashboard
    @GetMapping
    public List<Participante> listar() {
        return repository.findAll();
    }
    
    // Detalhes de um participante específico
    @GetMapping("/{id}")
    public ResponseEntity<Participante> buscarPorId(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}