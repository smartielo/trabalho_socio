package com.iascj.api.controller;

import com.iascj.api.model.Usuario;
import com.iascj.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000") // Permite o React
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> dados) {
        String cpf = dados.get("cpf");
        String senha = dados.get("senha");

        Optional<Usuario> user = usuarioRepository.findByCpf(cpf);

        // Verificação simples (sem hash para teste)
        if (user.isPresent() && user.get().getSenha().equals(senha)) {
            return ResponseEntity.ok(Map.of("token", "fake-jwt-token-123", "msg", "Login realizado"));
        }
        return ResponseEntity.status(401).body(Map.of("msg", "Credenciais inválidas"));
    }

    @PostMapping("/cadastro-usuario")
    public ResponseEntity<?> cadastroUsuario(@RequestBody Usuario usuario) {
        if (usuarioRepository.findByCpf(usuario.getCpf()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("msg", "CPF já cadastrado"));
        }
        usuarioRepository.save(usuario);
        return ResponseEntity.status(201).body(Map.of("msg", "Usuário criado com sucesso"));
    }
}