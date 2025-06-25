package com.fakecombank.orion.service;

import java.util.List;

import com.fakecombank.orion.constant.OrderType;
import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.OrderItem;
import com.fakecombank.orion.model.User;

public interface OrderService {

    Order createOrder(User user, OrderItem orderItem, OrderType orderType);

    Order getOrderById(Long orderId);

    List<Order> getOrdersByUser(Long userId, OrderType orderType, String assetSymbol);

    Order processOrder(Coin coin, double quantity, OrderType orderType, User user);
}
