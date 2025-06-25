package com.fakecombank.orion.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.WalletTransactionType;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.model.WalletTransaction;
import com.fakecombank.orion.repository.TransactionRepository;
import com.fakecombank.orion.service.TransactionService;

@Service
public class TransactionServiceImpl implements TransactionService {
    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public WalletTransaction createTransaction(Wallet wallet, WalletTransactionType transactionType, Long transferId,
            String purpose, Long amount) {
        WalletTransaction transaction = new WalletTransaction();

        transaction.setWallet(wallet);
        transaction.setType(transactionType);
        transaction.setTransferId(transferId);
        transaction.setPurpose(purpose);
        transaction.setAmount(amount);
        transaction.setDate(LocalDate.now());

        return transactionRepository.save(transaction);
    }

    @Override
    public List<WalletTransaction> getTransactionsByWallet(Wallet wallet) {
        
        return transactionRepository.findByWalletId(wallet.getId());
    }
}
