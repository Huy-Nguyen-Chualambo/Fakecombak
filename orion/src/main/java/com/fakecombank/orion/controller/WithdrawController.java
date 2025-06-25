package com.fakecombank.orion.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.constant.WalletTransactionType;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.model.Withdraw;
import com.fakecombank.orion.service.TransactionService;
import com.fakecombank.orion.service.UserService;
import com.fakecombank.orion.service.WalletService;
import com.fakecombank.orion.service.WithdrawService;

@RestController
public class WithdrawController {
    @Autowired
    private WithdrawService withdrawService;
    @Autowired
    private WalletService walletService;
    @Autowired
    private UserService userService;
    @Autowired
    private TransactionService transactionService;
    // @Autowired
    // private WalletTransactionService walletTransactionService;

    @PostMapping("/api/withdrawal/{amount}")
    public ResponseEntity<?> requestWithdraw(@PathVariable Long amount, @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);
        Withdraw withdraw = withdrawService.requestWithdraw(amount, user);

        walletService.addBalance(wallet, -withdraw.getAmount());

        transactionService.createTransaction(wallet,
                WalletTransactionType.WITHDRAW, null, "Withdraw request",
                withdraw.getAmount());

        return new ResponseEntity<>(withdraw, HttpStatus.OK);
    }

    @PatchMapping("/api/admin/withdrawal/{id}/proceed/{accept}")
    public ResponseEntity<?> processWithdraw(@PathVariable Long id, @PathVariable boolean accept,
            @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Withdraw withdraw = withdrawService.processWithdraw(id, accept);
        Wallet wallet = walletService.getUserWallet(user);

        if (!accept) {
            walletService.addBalance(wallet, withdraw.getAmount());
        }

        return new ResponseEntity<>(withdraw, HttpStatus.OK);
    }

    @GetMapping("/api/withdrawal")
    public ResponseEntity<List<Withdraw>> getUserWithdrawsHistory(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        List<Withdraw> withdraws = withdrawService.getUserWithdrawsHistory(user);
        return new ResponseEntity<>(withdraws, HttpStatus.OK);
    }

    @GetMapping("/api/admin/withdrawal")
    public ResponseEntity<List<Withdraw>> getAllWithdrawsRequest(@RequestHeader("Authorization") String jwt) {
        List<Withdraw> withdraws = withdrawService.getAllWithdrawsRequest();
        return new ResponseEntity<>(withdraws, HttpStatus.OK);
    }
}
