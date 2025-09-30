package com.example.springapp.repository;

import com.example.springapp.model.Intent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface IntentRepository extends JpaRepository<Intent, Long> {
    Optional<Intent> findByKeyword(String keyword);
}
