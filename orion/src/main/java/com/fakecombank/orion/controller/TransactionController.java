package com.fakecombank.orion.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.model.WalletTransaction;
import com.fakecombank.orion.service.TransactionService;
import com.fakecombank.orion.service.UserService;
import com.fakecombank.orion.service.WalletService;

@RestController
public class TransactionController {
    @Autowired
    private WalletService walletService;
    @Autowired
    private UserService userService;
    @Autowired
    private TransactionService transactionService;

    @GetMapping("/api/transactions")
    public ResponseEntity<List<WalletTransaction>> getUserWallet(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);
        List<WalletTransaction> transactions = transactionService.getTransactionsByWallet(wallet);

        return new ResponseEntity<>(transactions, HttpStatus.ACCEPTED);
    }
}
