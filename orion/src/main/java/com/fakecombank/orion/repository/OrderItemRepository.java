package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
}
