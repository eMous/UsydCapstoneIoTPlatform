package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class DataRetrieveCloseRequestModel {
    public String retrievalId;

    public DataRetrieveCloseRequestModel(String retrievalId) {
        this.retrievalId = retrievalId;
    }

    public void request(Context context, Runnable runnable) {
        HttpUtil.post(URLs.GetCloseDataRetrieveUrl(), this, Success.class, response -> {
                    if (response.success) {
                        HttpUtil.get(URLs.GetParticipantNotificationsUrl(), new Object(), ParticipantNotifications.class,
                                participantNotifications -> {
                                    participantNotifications.handle(context);
                                    runnable.run();
                                }, context);

                    } else {
                        response.handle(context);
                    }
                },
                context);
    }
}
