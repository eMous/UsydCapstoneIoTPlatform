package capstone.cs26.iotPlatform.util;

import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;

public class Conf {
    static final String TAG = "Conf";

    public final static String BROADCAST_FILTER_BACK_TO_LOGIN = "backToLogin";
    public final static String MESSAGE_BACK_TO_LOGIN_MESSAGE_KEY = "backToLoginReason";

    public final static String INTENT_EXTRA_MSG_TO_SHOW = "msgToShow";

    public final static String GENDER_DEFAULT = "Select";
    public final static String GENDER_MALE_STR = "Male";
    public final static String GENDER_FEMALE_STR = "Female";
    public final static String GENDER_SECRET_STR = "Prefer not to say";

    public final static int GENDER_MALE_INT = 1;
    public final static int GENDER_FEMALE_INT = 2;
    public final static int GENDER_SECRET_INT = 3;
    public final static int GENDER_NOT_GIVEN_INT = 4;
    public final static int GENDER_ERROR_INT = 0;
    public final static String SENSOR_ID_JOINER = "__";

    public final static long INTERVAL_TO_UPDATE_LOCATION = 30 * 1000;
    public final static float DISTANCE_TO_UPDATE_LOCATION = 1;

    public final static String GetGenderStrByIndex(int i) {
        switch (i) {
            case GENDER_ERROR_INT:
                return GENDER_DEFAULT;
            case GENDER_MALE_INT:
                return GENDER_MALE_STR;
            case GENDER_FEMALE_INT:
                return GENDER_FEMALE_STR;
            case GENDER_SECRET_INT:
                return GENDER_SECRET_STR;
            case GENDER_NOT_GIVEN_INT:
                return GENDER_SECRET_STR;
        }
        return null;
    }

    public final static int GetGenderIndexByStr(String gender) {
        if (gender.equals(GENDER_MALE_STR)) return GENDER_MALE_INT;
        if (gender.equals(GENDER_FEMALE_STR)) return GENDER_FEMALE_INT;
        if (gender.equals(GENDER_SECRET_STR)) return GENDER_SECRET_INT;
        return GENDER_ERROR_INT;
    }

    public static boolean isWatch(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT_WATCH) {
            return false;
        } else {
            return context.getPackageManager().hasSystemFeature(PackageManager.FEATURE_WATCH);
        }
    }

    public final static String WEARABLE_DEVICE_STR = "Wearable Device";
    public final static String MOBILE_PHONE_STR = "Mobile Phone";
}
