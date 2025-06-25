package com.fakecombank.orion.service;

import java.util.List;

import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Withdraw;

public interface WithdrawService {

    Withdraw requestWithdraw(Long amount, User user);

    Withdraw processWithdraw(Long withdrawId, boolean accept);

    List<Withdraw> getUserWithdrawsHistory(User user);

    List<Withdraw> getAllWithdrawsRequest();
}
