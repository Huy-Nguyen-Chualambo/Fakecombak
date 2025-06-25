package com.fakecombank.orion.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Watchlist;
import com.fakecombank.orion.repository.WatchlistRepository;
import com.fakecombank.orion.service.WatchlistService;

@Service
public class WatchlistServiceImpl implements WatchlistService {
    @Autowired
    private WatchlistRepository watchlistRepository;

    @Override
    public Watchlist findUserWatchlist(Long userId) {
        Watchlist watchlist = watchlistRepository.findByUserId(userId);

        if (watchlist == null) {
            throw new RuntimeException("Watchlist not found");
        }

        return watchlist;
    }

    @Override
    public Watchlist createWatchlist(User user) {
        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);

        return watchlistRepository.save(watchlist);
    }

    @Override
    public Watchlist findById(Long id) {
        Optional<Watchlist> watchlist = watchlistRepository.findById(id);

        if (watchlist.isPresent()) {
            return watchlist.get();
        } else {
            throw new RuntimeException("Watchlist not found");
        }
    }

    @Override
    public Coin addItemToWatchList(Coin coin, User user) {
        Watchlist watchlist = findUserWatchlist(user.getId());

        if (watchlist.getCoins().contains(coin)) {
            watchlist.getCoins().remove(coin);
            watchlistRepository.save(watchlist);

            return coin;
        }

        watchlist.getCoins().add(coin);
        watchlistRepository.save(watchlist);

        return coin;
    }
}
