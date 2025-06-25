package com.fakecombank.orion.model;

import java.time.LocalDate;

import com.fakecombank.orion.constant.WalletTransactionType;

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
public class WalletTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @ManyToOne
    private Wallet wallet;
    @Enumerated(EnumType.STRING)
    private WalletTransactionType type;
    private LocalDate date;
    private Long transferId;
    private String purpose;
    private Long amount;
}
