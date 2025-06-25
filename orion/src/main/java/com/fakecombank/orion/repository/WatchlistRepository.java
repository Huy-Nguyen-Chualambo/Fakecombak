package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.Watchlist;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    Watchlist findByUserId(Long userId);
}
