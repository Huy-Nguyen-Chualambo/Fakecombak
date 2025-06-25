package com.fakecombank.orion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.fakecombank.orion.model.WalletTransaction;

@Repository
public interface TransactionRepository extends JpaRepository<WalletTransaction, Long> {

    List<WalletTransaction> findByWalletId(Long walletId);
}
