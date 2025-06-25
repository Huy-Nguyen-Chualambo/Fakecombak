package com.fakecombank.orion.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fakecombank.orion.constant.OrderStatus;
import com.fakecombank.orion.constant.OrderType;
import com.fakecombank.orion.model.Asset;
import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.Order;
import com.fakecombank.orion.model.OrderItem;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.OrderItemRepository;
import com.fakecombank.orion.repository.OrderRepository;
import com.fakecombank.orion.service.AssetService;
import com.fakecombank.orion.service.OrderService;
import com.fakecombank.orion.service.WalletService;

@Service
public class OrderServiceImpl implements OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private WalletService walletService;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private AssetService assetService;

    @Override
    public Order createOrder(User user, OrderItem orderItem, OrderType orderType) {
        double price = orderItem.getCoin().getCurrentPrice() * orderItem.getQuantity();

        Order order = new Order();
        order.setUser(user);
        order.setOrderItem(orderItem);
        order.setOrderType(orderType);
        order.setPrice(BigDecimal.valueOf(price));
        order.setTimestamp(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        orderRepository.save(order);

        return order;
    }

    @Override
    public Order getOrderById(Long orderId) {

        return orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
    }

    @Override
    public List<Order> getOrdersByUser(Long userId, OrderType orderType, String assetSymbol) {
        
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    public Order processOrder(Coin coin, double quantity, OrderType orderType, User user) {
        
        if (orderType.equals(OrderType.BUY)) {
            return buyAsset(coin, quantity, user);
        } else if (orderType.equals(OrderType.SELL)) {
            return sellAsset(coin, quantity, user);
        } else {
            throw new IllegalArgumentException("Invalid order type");
        }
    }

    private OrderItem createOrderItem(Coin coin, double quantity, double buyPrice, double sellPrice) {
        OrderItem orderItem = new OrderItem();

        orderItem.setCoin(coin);
        orderItem.setQuantity(quantity);
        orderItem.setBuyPrice(buyPrice);
        orderItem.setSellPrice(sellPrice);

        orderItemRepository.save(orderItem);

        return orderItem;
    }

    @Transactional
    public Order buyAsset(Coin coin, double quantity, User user) {
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        double buyPrice = coin.getCurrentPrice();

        OrderItem orderItem = createOrderItem(coin, quantity, buyPrice, 0);

        Order order = createOrder(user, orderItem, OrderType.BUY);

        orderItem.setOrder(order);

        walletService.payOrderPayment(order, user);

        order.setStatus(OrderStatus.SUCCESS);
        order.setOrderType(OrderType.BUY);

        orderRepository.save(order);

        Asset oldAsset = assetService.findAssetByUserIdAndCoinId(order.getUser().getId(), order.getOrderItem().getCoin().getId());

        if (oldAsset != null) {
            assetService.updateAsset(oldAsset.getId(), quantity);
        } else {
            assetService.createAsset(user, orderItem.getCoin(), orderItem.getQuantity());
        }

        return order;
    }

    @Transactional
    public Order sellAsset(Coin coin, double quantity, User user) {
        
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        double sellPrice = coin.getCurrentPrice();
        Asset assetToSell = assetService.findAssetByUserIdAndCoinId(user.getId(), coin.getId());

        if (assetToSell != null) {
            double buyPrice = assetToSell.getBuyPrice();

            OrderItem orderItem = createOrderItem(coin, quantity, buyPrice, sellPrice);

            Order order = createOrder(user, orderItem, OrderType.SELL);

            orderItem.setOrder(order);

            if (assetToSell.getQuantity() >= quantity) {
                order.setStatus(OrderStatus.SUCCESS);
                order.setOrderType(OrderType.SELL);

                orderRepository.save(order);

                walletService.payOrderPayment(order, user);

                Asset updatedAsset = assetService.updateAsset(assetToSell.getId(), -quantity);

                if (updatedAsset.getQuantity() * coin.getCurrentPrice() <= 1) {
                    assetService.deleteAsset(updatedAsset.getId());
                }

                return order;
            }

            throw new RuntimeException("Insufficient quantity to sell");
        }

        throw new RuntimeException("Asset not found");
    }
}
