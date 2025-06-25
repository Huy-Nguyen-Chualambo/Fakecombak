package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.Coin;

public interface CoinRepository extends JpaRepository<Coin, String> {

}
