package com.fakecombank.orion.model;

import java.time.LocalDateTime;

import com.fakecombank.orion.constant.WithdrawStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Data
@Entity
public class Withdraw {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Enumerated(EnumType.STRING)
    private WithdrawStatus status;
    private long amount;
    @ManyToOne
    private User user;
    private LocalDateTime date = LocalDateTime.now();
}
