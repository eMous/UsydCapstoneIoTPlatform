package capstone.cs26.iotPlatform.model;

public class LogoutRequestModel {
    String fcmToken;

    public LogoutRequestModel(String fcmToken) {
        this.fcmToken = fcmToken;
    }
}
