package com.fakecombank.orion.service;

import java.util.List;

import com.fakecombank.orion.model.Coin;

public interface CoinService {

    List<Coin> getCoinsList(int page);

    String getMarketChart(String coinId, int days);

    String getCoinDetails(String coinId);

    Coin findById(String coinId);

    String searchCoin(String keyword);

    String getTop50CoinsByMarketCapRank();

    String getTrendingCoins();
}
