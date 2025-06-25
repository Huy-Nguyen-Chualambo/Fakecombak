package com.fakecombank.orion.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUserId(Long userId);
}
