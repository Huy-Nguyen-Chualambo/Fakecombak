package com.fakecombank.orion.service;

import java.util.List;

import com.fakecombank.orion.constant.WalletTransactionType;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.model.WalletTransaction;

public interface TransactionService {

    WalletTransaction createTransaction(Wallet wallet, WalletTransactionType transactionType, Long transferId,
            String purpose, Long amount);

    List<WalletTransaction> getTransactionsByWallet(Wallet wallet);
}
