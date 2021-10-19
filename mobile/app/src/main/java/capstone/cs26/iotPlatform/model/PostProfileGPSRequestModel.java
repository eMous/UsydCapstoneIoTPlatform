package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class PostProfileGPSRequestModel {
    Double lat;
    Double lon;

    public PostProfileGPSRequestModel(Double lat, Double lon) {
        this.lat = lat;
        this.lon = lon;
    }

    public void request(Context context) {
        HttpUtil.post(URLs.GetParticipantLocationUrl(), this, Success.class, response -> {
            response.handle(context);
        }, context);
    }
}
