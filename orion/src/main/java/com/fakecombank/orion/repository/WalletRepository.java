package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.Wallet;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    
    Wallet findByUserId(Long userId);
}
