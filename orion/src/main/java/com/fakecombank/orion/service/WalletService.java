package com.fakecombank.orion.service;

import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Wallet;

public interface WalletService {

    Wallet getUserWallet(User user);

    Wallet addBalance(Wallet wallet, Long money);

    Wallet findWalletById(Long id);

    Wallet walletToWalletTransfer(User sender, Wallet receiver, Long amount);

    Wallet payOrderPayment(Order order, User user);
}
