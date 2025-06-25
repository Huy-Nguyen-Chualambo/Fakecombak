package com.fakecombank.orion.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Watchlist;
import com.fakecombank.orion.service.CoinService;
import com.fakecombank.orion.service.UserService;
import com.fakecombank.orion.service.WatchlistService;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {
    @Autowired
    private WatchlistService watchlistService;
    @Autowired
    private UserService userService;
    @Autowired
    private CoinService coinService;

    @GetMapping("/user")
    public ResponseEntity<Watchlist> getUserWatchlist(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Watchlist watchlist = watchlistService.findUserWatchlist(user.getId());
        return ResponseEntity.ok(watchlist);
    }

    @GetMapping("/{watchlistId}")
    public ResponseEntity<Watchlist> getWatchlistById(@PathVariable Long watchlistId) {
        Watchlist watchlist = watchlistService.findById(watchlistId);
        return ResponseEntity.ok(watchlist);
    }

    @PatchMapping("/add/coin/{coinId}")
    public ResponseEntity<Coin> addCoinToWatchlist(@PathVariable String coinId, @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinService.findById(coinId);
        Coin addedCoin = watchlistService.addItemToWatchList(coin, user);
        return ResponseEntity.ok(addedCoin);
    }
}
