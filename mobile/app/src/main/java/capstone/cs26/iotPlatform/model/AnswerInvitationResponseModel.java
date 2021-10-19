package capstone.cs26.iotPlatform.model;

import android.content.Context;
import android.widget.Toast;

public class AnswerInvitationResponseModel {
    Boolean success;
    String msg;
    ParticipantNotifications participantNotifications;
    String projectId;

    public void handle(Context context, Boolean acceptProject) {
        participantNotifications.handle(context);
        if (msg != null) {
            Toast.makeText(context, msg, Toast.LENGTH_LONG).show();
        }
        if (projectId != null) {
            (new GetProfileRequestModel()).get(context);
            if (acceptProject && success) {
                // Check sensor settings
                (new ProjectDetailRequestModel(projectId)).requestAndCheckSensorSettings(context);
            } else {
                (new ProjectDetailRequestModel(projectId)).request(context);
            }
        }
    }
}
