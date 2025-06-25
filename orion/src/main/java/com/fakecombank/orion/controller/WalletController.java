package com.fakecombank.orion.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.constant.WalletTransactionType;
import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.PaymentOrder;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Wallet;
import com.fakecombank.orion.model.WalletTransaction;
import com.fakecombank.orion.service.OrderService;
import com.fakecombank.orion.service.PaymentService;
import com.fakecombank.orion.service.TransactionService;
import com.fakecombank.orion.service.UserService;
import com.fakecombank.orion.service.WalletService;

@RestController
public class WalletController {
    @Autowired
    private WalletService walletService;
    @Autowired
    private UserService userService;
    @Autowired
    private OrderService orderService;
    @Autowired
    private PaymentService paymentService;
    @Autowired
    private TransactionService transactionService;

    @GetMapping("/api/wallet")
    public ResponseEntity<Wallet> getUserWallet(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }

    @PutMapping("/api/wallet/{walletId}/transfer")
    public ResponseEntity<Wallet> walletToWalletTransfer(@RequestHeader("Authorization") String jwt,
            @PathVariable Long walletId,
            @RequestBody WalletTransaction request) {
        User senderUser = userService.findUserProfileByJwt(jwt);
        Wallet receiverWallet = walletService.findWalletById(walletId);
        Wallet wallet = walletService.walletToWalletTransfer(senderUser, receiverWallet, request.getAmount());

        transactionService.createTransaction(wallet, WalletTransactionType.WALLET_TRANSFER, receiverWallet.getId(),
                request.getPurpose(), request.getAmount());

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }

    @PutMapping("/api/wallet/order/{orderId}/pay")
    public ResponseEntity<Wallet> payOrderPayment(@RequestHeader("Authorization") String jwt,
            @PathVariable Long orderId) {
        User User = userService.findUserProfileByJwt(jwt);
        Order order = orderService.getOrderById(orderId);
        Wallet wallet = walletService.payOrderPayment(order, User);

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }

    @PutMapping("/api/wallet/deposit")
    public ResponseEntity<Wallet> addBalanceToWallet(@RequestHeader("Authorization") String jwt,
            @RequestParam(name = "order_id") Long orderId, @RequestParam(name = "payment_id") String paymentId)
            throws Exception {
        User User = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(User);
        PaymentOrder paymentOrder = paymentService.getPaymentOrderById(orderId);
        Boolean isPaymentSuccess = paymentService.proceedPaymentOrder(paymentOrder, paymentId);

        if (wallet.getBalance() == null) {
            wallet.setBalance(BigDecimal.valueOf(0));
        }

        if (isPaymentSuccess) {
            wallet = walletService.addBalance(wallet, paymentOrder.getAmount());
        }

        return new ResponseEntity<>(wallet, HttpStatus.ACCEPTED);
    }
}
