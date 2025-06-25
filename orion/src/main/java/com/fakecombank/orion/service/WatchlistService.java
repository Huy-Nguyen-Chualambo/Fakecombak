package com.fakecombank.orion.service;

import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Watchlist;

public interface WatchlistService {

    Watchlist findUserWatchlist(Long userId);

    Watchlist createWatchlist(User user);

    Watchlist findById(Long id);

    Coin addItemToWatchList(Coin coin, User user);
}
