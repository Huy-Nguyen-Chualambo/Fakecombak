package com.fakecombank.orion.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fakecombank.orion.constant.OrderType;
import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.request.CreateOrderRequest;
import com.fakecombank.orion.service.CoinService;
import com.fakecombank.orion.service.OrderService;
import com.fakecombank.orion.service.UserService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private UserService userService;
    @Autowired
    private CoinService coinService;
    // @Autowired
    // private WalletTransactionService walletTransactionService;

    @PostMapping("/pay")
    public ResponseEntity<Order> payOrderPayment(@RequestHeader("Authorization") String jwt,
            @RequestBody CreateOrderRequest request) {
        User user = userService.findUserProfileByJwt(jwt);
        Coin coin = coinService.findById(request.getCoinId());
        Order order = orderService.processOrder(coin, request.getQuantity(), request.getOrderType(), user);

        return ResponseEntity.ok(order);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@RequestHeader("Authorization") String jwtToken,
            @PathVariable Long orderId) {
        User user = userService.findUserProfileByJwt(jwtToken);
        Order order = orderService.getOrderById(orderId);

        if (order.getUser().getId().equals(user.getId())) {
            return ResponseEntity.ok(order);
        } else {
            throw new RuntimeException("Unauthorized access to order");
        }
    }

    @GetMapping()
    public ResponseEntity<List<Order>> getAllOrdersForUser(@RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) OrderType order_type,
            @RequestParam(required = false) String asset_symbol) {
        Long userId = userService.findUserProfileByJwt(jwt).getId();
        List<Order> orders = orderService.getOrdersByUser(userId, order_type, asset_symbol);

        return ResponseEntity.ok(orders);
    }
}
