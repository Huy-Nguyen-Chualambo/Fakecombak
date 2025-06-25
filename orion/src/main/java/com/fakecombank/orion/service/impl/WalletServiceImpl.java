package com.fakecombank.orion.service.impl;

import java.math.BigDecimal;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.OrderType;
import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.repository.WalletRepository;
import com.fakecombank.orion.service.WalletService;

@Service
public class WalletServiceImpl implements WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Override
    public Wallet getUserWallet(User user) {
        Wallet wallet = walletRepository.findByUserId(user.getId());

        if (wallet == null) {
            wallet = new Wallet();
            wallet.setUser(user);

            Long id;
            do {
                id = generateRandomWalletId();
            } while (walletRepository.existsById(id));
            wallet.setId(id);

            walletRepository.save(wallet);
        }

        return wallet;
    }

    @Override
    public Wallet addBalance(Wallet wallet, Long money) {
        BigDecimal balance = wallet.getBalance();
        BigDecimal newBalance = balance.add(new BigDecimal(money));

        wallet.setBalance(newBalance);
        walletRepository.save(wallet);

        return wallet;
    }

    @Override
    public Wallet findWalletById(Long id) {
        Optional<Wallet> wallet = walletRepository.findById(id);

        if (wallet.isPresent()) {
            return wallet.get();
        } else {
            throw new RuntimeException("Wallet not found");
        }
    }

    @Override
    public Wallet walletToWalletTransfer(User sender, Wallet receiver, Long amount) {
        Wallet senderWallet = getUserWallet(sender);

        if (senderWallet.getBalance().compareTo(BigDecimal.valueOf(amount)) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        BigDecimal senderBalance = senderWallet.getBalance().subtract(BigDecimal.valueOf(amount));
        senderWallet.setBalance(senderBalance);
        walletRepository.save(senderWallet);

        BigDecimal receiverBalance = receiver.getBalance().add(BigDecimal.valueOf(amount));
        receiver.setBalance(receiverBalance);
        walletRepository.save(receiver);

        return senderWallet;
    }

    @Override
    public Wallet payOrderPayment(Order order, User user) {
        Wallet wallet = getUserWallet(user);

        if (order.getOrderType().equals(OrderType.BUY)) {
            BigDecimal newBalance = wallet.getBalance().subtract(order.getPrice());

            if (newBalance.compareTo(order.getPrice()) < 0) {
                throw new RuntimeException("Insufficient balance");
            }

            wallet.setBalance(newBalance);
        } else {
            BigDecimal newBalance = wallet.getBalance().add(order.getPrice());
            wallet.setBalance(newBalance);
        }

        walletRepository.save(wallet);

        return wallet;
    }

    private Long generateRandomWalletId() {
        return 10000L + (long) (Math.random() * 90000L); // 5 chữ số, từ 10000 đến 99999
    }
}
