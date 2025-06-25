package com.fakecombank.orion.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fakecombank.orion.model.PaymentDetails;

public interface PaymentDetailsRepository extends JpaRepository<PaymentDetails, Long> {

    PaymentDetails findByUserId(Long userId);
}
