package com.fakecombank.orion.request;

import com.fakecombank.orion.constant.OrderType;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private String coinId;
    private double quantity;
    private OrderType orderType;
}
