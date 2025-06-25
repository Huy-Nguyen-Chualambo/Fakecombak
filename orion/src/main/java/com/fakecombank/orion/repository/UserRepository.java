package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}
