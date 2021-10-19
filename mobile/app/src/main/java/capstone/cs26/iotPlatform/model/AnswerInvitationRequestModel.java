package capstone.cs26.iotPlatform.model;

import android.content.Context;

import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;

public class AnswerInvitationRequestModel {
    String projectId;
    boolean accept;

    public AnswerInvitationRequestModel(String projectId, boolean accept) {
        this.projectId = projectId;
        this.accept = accept;
    }

    public void answer(Context context, Runnable runnable) {
        HttpUtil.post(URLs.GetAnswerInvitationUrl(), this,
                AnswerInvitationResponseModel.class, answerResponse -> {
                    answerResponse.handle(context, accept);
                    runnable.run();
                }, context);
    }
}
