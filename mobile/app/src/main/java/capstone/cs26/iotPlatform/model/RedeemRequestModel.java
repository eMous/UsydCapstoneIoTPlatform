package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class RedeemRequestModel {
    public String projectId;
    Float pointsToRedeem;

    public RedeemRequestModel(String projectId, Float pointsToRedeem) {
        this.projectId = projectId;
        this.pointsToRedeem = pointsToRedeem;
    }

    public void request(Context context) {
        HttpUtil.post(URLs.GetRedeemUrl(), this, RedeemResponseModel.class, response -> {
            response.handle(context);
        }, context);
    }
}
