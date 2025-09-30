package com.example.springapp.model;

import jakarta.persistence.*;

@Entity
public class Intent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;        // Logical name of the intent
    private String keyword;     // Word or phrase that triggers the intent
    private String response;    // Predefined bot response

    public Intent() {}

    public Intent(String name, String keyword, String response) {
        this.name = name;
        this.keyword = keyword;
        this.response = response;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }
}

