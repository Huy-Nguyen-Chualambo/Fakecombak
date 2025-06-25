package com.fakecombank.orion.service;

import java.util.List;

import com.fakecombank.orion.model.Asset;
import com.fakecombank.orion.model.Coin;
import com.fakecombank.orion.model.User;

public interface AssetService {

    Asset createAsset(User user, Coin coin, double quantity);

    Asset getAssetById(Long assetId);

    Asset getAssetByUserIdAndId(Long userId, Long assetId);

    List<Asset> getUsersAssets(Long userId);

    Asset updateAsset(Long assetId, double quantity);

    Asset findAssetByUserIdAndCoinId(Long userId, String coinId);

    void deleteAsset(Long assetId);
}
