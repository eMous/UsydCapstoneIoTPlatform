package capstone.cs26.iotPlatform.model;

import java.util.Date;

public class Notification {
    public Date sentTime;
    public String notificationType;
    public Object notificationObj;

    public Notification(Date sentTime, String notificationType, Object notificationObj) {
        this.sentTime = sentTime;
        this.notificationType = notificationType;
        this.notificationObj = notificationObj;
    }
}
