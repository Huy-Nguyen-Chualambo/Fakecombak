package com.fakecombank.orion.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fakecombank.orion.model.Asset;
import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.User;
import com.fakecombank.orion.repository.AssetRepository;
import com.fakecombank.orion.service.AssetService;

@Service
public class AssetServiceImpl implements AssetService {
    @Autowired
    private AssetRepository assetRepository;

    @Override
    public Asset createAsset(User user, Coin coin, double quantity) {
        Asset asset = new Asset();

        asset.setUser(user);
        asset.setCoin(coin);
        asset.setQuantity(quantity);
        asset.setBuyPrice(coin.getCurrentPrice());

        return assetRepository.save(asset);
    }

    @Override
    public Asset getAssetById(Long assetId) {
        
        return assetRepository.findById(assetId).orElseThrow(() -> new RuntimeException("Asset not found"));
    }

    @Override
    public Asset getAssetByUserIdAndId(Long userId, Long assetId) {
        
        throw new UnsupportedOperationException("Unimplemented method 'getAssetByUserIdAndId'");
    }

    @Override
    public List<Asset> getUsersAssets(Long userId) {
        
        return assetRepository.findByUserId(userId);
    }

    @Override
    public Asset updateAsset(Long assetId, double quantity) {
        Asset oldAsset = getAssetById(assetId);

        oldAsset.setQuantity(oldAsset.getQuantity() + quantity);

        return assetRepository.save(oldAsset);
    }

    @Override
    public Asset findAssetByUserIdAndCoinId(Long userId, String coinId) {
        
        return assetRepository.findByUserIdAndCoinId(userId, coinId);
    }

    @Override
    public void deleteAsset(Long assetId) {
        
        assetRepository.deleteById(assetId);
    }
}
