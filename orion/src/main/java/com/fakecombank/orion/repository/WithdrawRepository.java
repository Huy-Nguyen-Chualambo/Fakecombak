package com.fakecombank.orion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.Withdraw;

public interface WithdrawRepository extends JpaRepository<Withdraw, Long> {
    List<Withdraw> findByUserId(Long userId);
}
