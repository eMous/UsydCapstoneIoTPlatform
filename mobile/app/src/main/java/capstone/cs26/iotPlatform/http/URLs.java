package capstone.cs26.iotPlatform.http;

public class URLs {

    public static String ipOrHost = "34.151.82.81";

//    public static String ipOrHost = "ss.caihuashuai.com:3001";
//    public static String ipOrHost = "ss.caihuashuai.com:10001";

    public static String parBase() {
        return "http://" + ipOrHost + "/api/participant";
    }

    public static String proBase() {
        return "http://" + ipOrHost + "/api/projectowner";
    }

    public static String GetLoginUrl() {
        return parBase() + "/auth/login";
    }

    public static String GetLogoutUrl() {
        return parBase() + "/auth/logout";
    }

    public static String GetGotInvitationUrl() {
        return parBase() + "/project/received";
    }

    public static String GetLeaveProjectUrl() {
        return parBase() + "/project/leave";
    }

    public static String GetProjectDetailUrl() {
        return parBase() + "/project/";
    }

    public static String GetPostSensingDataUrl() {
        return parBase() + "/project/sensingData";
    }

    public static String GetAnswerInvitationUrl() {
        return parBase() + "/project/accept";
    }

    public static String GetRedeemUrl() {
        return parBase() + "/project/exchange";
    }

    public static String GetProfileUrl() {
        return parBase() + "/profile";
    }

    public static String GetParticipantNotificationsUrl() {
        return parBase() + "/profile/participantNotifications";
    }

    public static String GetParticipantLocationUrl() {
        return parBase() + "/profile/location";
    }

    public static String GetCloseDataRetrieveUrl() {
        return parBase() + "/project/retrievalNotifyRead";
    }

    public static String GetFrequencyDetailUrl() {
        return proBase() + "/publicResources/sensorFrequencies";
    }
}
