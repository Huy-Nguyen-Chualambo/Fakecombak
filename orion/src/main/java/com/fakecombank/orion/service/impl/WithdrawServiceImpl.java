package com.fakecombank.orion.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.constant.WithdrawStatus;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.model.Withdraw;
import com.fakecombank.orion.repository.WithdrawRepository;
import com.fakecombank.orion.service.WithdrawService;

@Service
public class WithdrawServiceImpl implements WithdrawService {
    @Autowired
    private WithdrawRepository withdrawRepository;

    @Override
    public Withdraw requestWithdraw(Long amount, User user) {
        Withdraw withdraw = new Withdraw();

        withdraw.setAmount(amount);
        withdraw.setUser(user);
        withdraw.setStatus(WithdrawStatus.PENDING);

        return withdrawRepository.save(withdraw);
    }

    @Override
    public Withdraw processWithdraw(Long withdrawId, boolean accept) {
        Optional<Withdraw> withdraw = withdrawRepository.findById(withdrawId);

        if (withdraw.isPresent()) {
            Withdraw withdrawRequest = withdraw.get();
            
            withdrawRequest.setDate(LocalDateTime.now());

            if (accept) {
                withdrawRequest.setStatus(WithdrawStatus.SUCCESS);
            } else {
                withdrawRequest.setStatus(WithdrawStatus.DECLINED);
            }

            return withdrawRepository.save(withdrawRequest);
        } else {
            throw new RuntimeException("Withdraw request not found");
        }
    }

    @Override
    public List<Withdraw> getUserWithdrawsHistory(User user) {
        
        return withdrawRepository.findByUserId(user.getId());
    }

    @Override
    public List<Withdraw> getAllWithdrawsRequest() {
        
        return withdrawRepository.findAll();
    }
}
