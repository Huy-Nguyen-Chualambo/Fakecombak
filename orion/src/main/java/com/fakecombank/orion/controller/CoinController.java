package com.fakecombank.orion.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.service.CoinService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/coins")
public class CoinController {
    @Autowired
    private CoinService coinService;
    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    ResponseEntity<List<Coin>> getCoinList(@RequestParam(required = false, name = "page") int page) {
        List<Coin> coins = coinService.getCoinsList(page);
        return new ResponseEntity<>(coins, HttpStatus.ACCEPTED);
    }

    @GetMapping("/{coinId}/chart")
    ResponseEntity<JsonNode> getMarketChart(@PathVariable String coinId, @RequestParam("days") int days) throws JsonMappingException, JsonProcessingException {
        String response = coinService.getMarketChart(coinId, days);
        JsonNode jsonNode = objectMapper.readTree(response);

        return new ResponseEntity<>(jsonNode, HttpStatus.ACCEPTED);
    }

    @GetMapping("/search")
    ResponseEntity<JsonNode> searchCoin(@RequestParam("q") String keyword) throws JsonMappingException, JsonProcessingException {
        String response = coinService.searchCoin(keyword);
        JsonNode jsonNode = objectMapper.readTree(response);

        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/top50")
    ResponseEntity<JsonNode> getTop50CoinsByMarketCapRank() throws JsonMappingException, JsonProcessingException {
        String response = coinService.getTop50CoinsByMarketCapRank();
        JsonNode jsonNode = objectMapper.readTree(response);

        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/trending")
    ResponseEntity<JsonNode> getTrendingCoins() throws JsonMappingException, JsonProcessingException {
        String response = coinService.getTrendingCoins();
        JsonNode jsonNode = objectMapper.readTree(response);

        return ResponseEntity.ok(jsonNode);
    }

    @GetMapping("/details/{coinId}")
    ResponseEntity<JsonNode> getCoinDetails(@PathVariable String coinId) throws JsonMappingException, JsonProcessingException {
        String response = coinService.getCoinDetails(coinId);
        JsonNode jsonNode = objectMapper.readTree(response);

        return ResponseEntity.ok(jsonNode);
    }
}
