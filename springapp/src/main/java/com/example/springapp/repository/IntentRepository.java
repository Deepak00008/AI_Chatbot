package com.example.springapp.repository;

import com.example.springapp.model.Intent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IntentRepository extends JpaRepository<Intent, Long> {}
