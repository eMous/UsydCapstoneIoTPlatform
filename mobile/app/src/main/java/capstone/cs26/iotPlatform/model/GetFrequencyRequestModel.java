package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class GetFrequencyRequestModel {
    public void request(Context context) {
        HttpUtil.get(URLs.GetFrequencyDetailUrl(), this, GetFrequencyResponseModel.class, frequencyDetail -> {
                    frequencyDetail.handle();
                }
                , null, context);
    }
}
