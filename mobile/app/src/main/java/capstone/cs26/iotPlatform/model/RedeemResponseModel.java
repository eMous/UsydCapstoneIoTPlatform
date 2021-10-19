package capstone.cs26.iotPlatform.model;

import android.content.Context;
import android.widget.Toast;

import capstone.cs26.iotPlatform.db.AppDatabase;

public class RedeemResponseModel {
    public Boolean success;
    public String msg;
    public Float successfulRedeemedPoint;
    public Float successfulExchangedFunding;
    public Float remainingPoints;
    public ParticipantProfile participantProfile;
    public Project project;

    void handle(Context context) {
        if (success) {
            AppDatabase appDatabase = AppDatabase.getInstance(context);
            AppDatabase.databaseWriteExecutor.execute(() -> {
                appDatabase.participantProfileDao().upsert(participantProfile);
                if (project != null) project.projectId = project._id;
                appDatabase.projectDao().upsert(project);
            });
        } else {
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
        }
    }
}
