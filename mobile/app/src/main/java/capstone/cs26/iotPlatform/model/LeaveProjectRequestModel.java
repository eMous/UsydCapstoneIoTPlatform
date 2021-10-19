package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class LeaveProjectRequestModel {
    public LeaveProjectRequestModel(String projectId) {
        this.projectId = projectId;
    }

    String projectId;

    public void request(Context context, Runnable runnable) {
        HttpUtil.post(URLs.GetLeaveProjectUrl(), this, Success.class, response -> {
            response.handle(context);
            runnable.run();
        }, context);
    }
}
