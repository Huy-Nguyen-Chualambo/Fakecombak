package com.fakecombank.orion.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    
    @GetMapping
    public String home() {

        return "home";
    }

    @GetMapping("/api")
    public String secure() {

        return "home secure";
    }
}
