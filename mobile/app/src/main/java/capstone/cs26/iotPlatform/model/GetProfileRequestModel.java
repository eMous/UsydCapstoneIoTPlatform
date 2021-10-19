package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class GetProfileRequestModel {
    public void get(Context context) {
        HttpUtil.get(URLs.GetProfileUrl(), this, ParticipantProfile.class, response -> {
            AppDatabase appDatabase = AppDatabase.getInstance(context);
            AppDatabase.databaseWriteExecutor.execute(() -> {
//                Log.e("ProfileRequestModel", "Profile update "+ response.toString());
                appDatabase.participantProfileDao().upsert(response);
            });
        }, context);
    }
}
