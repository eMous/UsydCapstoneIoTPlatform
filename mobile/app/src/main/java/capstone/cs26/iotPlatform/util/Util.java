package capstone.cs26.iotPlatform.util;

import android.content.Context;

import androidx.core.util.PatternsCompat;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.GetProfileRequestModel;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.ProjectDetailRequestModel;

public class Util {
    public static void forceRefreshAll(Context context) {
        HttpUtil.get(URLs.GetProfileUrl(), new GetProfileRequestModel(), ParticipantProfile.class, profile -> {
            AppDatabase appDatabase = AppDatabase.getInstance(context);
            AppDatabase.databaseWriteExecutor.execute(() -> {
                appDatabase.participantProfileDao().upsert(profile);
                if (profile.projects != null) {
                    for (int i = 0; i < profile.projects.size(); ++i) {
                        String prjId = profile.projects.get(i).projectId;
                        ProjectDetailRequestModel projectDetailRequestModel = new ProjectDetailRequestModel(prjId);
                        projectDetailRequestModel.request(context);
                    }
                }
            });
        }, context);
        HttpUtil.get(URLs.GetParticipantNotificationsUrl(), new Object(), ParticipantNotifications.class,
                participantNotifications -> {
                    participantNotifications.handle(context);
                    if (participantNotifications.unhandledInvitations != null) {
                        for (int i = 0; i < participantNotifications.unhandledInvitations.size(); ++i) {
                            String prjId = participantNotifications.unhandledInvitations.get(i).projectId;
                            ProjectDetailRequestModel projectDetailRequestModel = new ProjectDetailRequestModel(prjId);
                            projectDetailRequestModel.request(context);
                        }
                    }
                }, context);
    }

    public static boolean checkEmail(String emailStr, StringBuilder responseBuilder) {
        if (responseBuilder == null) {
            return false;
        }
        responseBuilder.setLength(0);
        if (emailStr == null || emailStr.isEmpty()) {
            responseBuilder.append("Email is Required");
            return false;
        }
        if (!PatternsCompat.EMAIL_ADDRESS.matcher(emailStr).matches()) {
            responseBuilder.append("Please enter a valid email!");
            return false;
        }
        return true;
    }

    // Created methods For unit testing
    public static boolean checkName(String nameStr, StringBuilder responseBuilder) {
        if (responseBuilder == null) {
            return false;
        }
        responseBuilder.setLength(0);
        if (nameStr.isEmpty()) {
            responseBuilder.append("Name is not be empty");
            return false;
        }
        if (nameStr.length() > 12) {
            responseBuilder.append("THe length of the name should not be greater than 12");
            return false;
        }
        return true;
    }

    public static boolean checkPasswordFormat(String passwordStr, StringBuilder responseBuilder) {
        if (responseBuilder == null) {
            return false;
        }
        responseBuilder.setLength(0);

        if (passwordStr.length() < 6) {
            responseBuilder.append("The length of the password should not be less than 6.");
            return false;
        }
        if (passwordStr.isEmpty()) {
            responseBuilder.append("The password should not be empty.");
            return false;
        }
        return true;
    }


    public static boolean checkPasswordMatch(String etPassword, String etPasswordAgain, StringBuilder responseBuilder) {
        if (responseBuilder == null) {
            return false;
        }
        responseBuilder.setLength(0);
        if (!etPassword.equals(etPasswordAgain)) {
            responseBuilder.append("The password doesn't match.");
            return false;
        }
        return true;
    }

    public static String getMonthStr(Integer month) {
        int monthIndex = month - 1;
        String[] monthNames = {"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"};
        if (monthIndex >= monthNames.length) return "Unknown";
        return monthNames[monthIndex];
    }

    public static String getQuarter(Integer quarter) {
        if (quarter.equals(1)) {
            return "Quarter 1";
        }

        if (quarter.equals(2)) {
            return "Quarter 2";
        }

        if (quarter.equals(3)) {
            return "Quarter 3";
        }

        if (quarter.equals(4)) {
            return "Quarter 4";
        }
        return "Unknown";
    }
}
