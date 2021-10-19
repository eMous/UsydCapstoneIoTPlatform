package capstone.cs26.iotPlatform.db;

import android.content.Context;

import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import androidx.room.TypeConverter;
import androidx.room.TypeConverters;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import capstone.cs26.iotPlatform.db.dao.ParticipantNotificationsDao;
import capstone.cs26.iotPlatform.db.dao.ParticipantProfileDao;
import capstone.cs26.iotPlatform.db.dao.ProjectDao;
import capstone.cs26.iotPlatform.db.dao.SensorRecordDao;
import capstone.cs26.iotPlatform.model.InFundingAccount;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.ProjectWallet;
import capstone.cs26.iotPlatform.model.RetrieveDataNotification;
import capstone.cs26.iotPlatform.model.SensorConf;
import capstone.cs26.iotPlatform.model.SensorRecord;
import capstone.cs26.iotPlatform.model.SimpleSensor;

@Database(entities = {
        SensorRecord.class,
        ParticipantProfile.class,
        ParticipantNotifications.class,
        Project.class},
        version = 1, exportSchema = false)
@TypeConverters({AppDatabase.Converters.class})
public abstract class AppDatabase extends RoomDatabase {
    private static final String DB_NAME = "appDatabase.db";
    private static final int NUMBER_OF_THREADS = 4;
    public static final ExecutorService databaseWriteExecutor =
            Executors.newFixedThreadPool(NUMBER_OF_THREADS);
    private static volatile AppDatabase instance;

    public AppDatabase() {
    }

    public static synchronized AppDatabase getInstance(Context context) {
        if (instance == null) {
            instance = create(context);
        }
        return instance;
    }

    private static AppDatabase create(final Context context) {
        return Room.databaseBuilder(
                context,
                AppDatabase.class,
                DB_NAME).build();
    }


    public abstract SensorRecordDao sensorRecordDao();

    public abstract ParticipantProfileDao participantProfileDao();

    public abstract ParticipantNotificationsDao participantNotificationsDao();

    public abstract ProjectDao projectDao();

    public static class Converters {
        @TypeConverter
        public static ArrayList<String> fromString(String value) {
            Type listType = new TypeToken<ArrayList<String>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromArrayList(ArrayList<String> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }


        @TypeConverter
        public static ArrayList<ProjectWallet> fromStringToProjectWalletList(String value) {
            Type listType = new TypeToken<ArrayList<ProjectWallet>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromProjectWalletListToString(ArrayList<ProjectWallet> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }


        @TypeConverter
        public static ArrayList<SensorConf> fromStringToSensorConfList(String value) {
            Type listType = new TypeToken<ArrayList<SensorConf>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromSensorConfListToString(ArrayList<SensorConf> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }


        @TypeConverter
        public static ArrayList<ParticipantNotifications.UnhandedInvitation> fromStringToUnhandedInvitationList(String value) {
            Type listType = new TypeToken<ArrayList<ParticipantNotifications.UnhandedInvitation>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromUnhandedInvitationListToString(ArrayList<ParticipantNotifications.UnhandedInvitation> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<Project.ProjectGoal> fromStringToProjectGoalList(String value) {
            Type listType = new TypeToken<ArrayList<Project.ProjectGoal>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromProjectGoalListToString(ArrayList<Project.ProjectGoal> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<Project.ProjectStatistic> fromStringToProjectStatisticList(String value) {
            Type listType = new TypeToken<ArrayList<Project.ProjectStatistic>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromProjectStatisticListToString(ArrayList<Project.ProjectStatistic> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<ParticipantProfile.ProjectInParticipantProfile> fromStringToProjectInParProfileList(String value) {
            Type listType = new TypeToken<ArrayList<ParticipantProfile.ProjectInParticipantProfile>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromProjectInParProfileListToString(ArrayList<ParticipantProfile.ProjectInParticipantProfile> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static Date toDate(Long value) {
            return value == null ? null : new Date(value);
        }

        @TypeConverter
        public static Long toLong(Date value) {
            return value == null ? null : value.getTime();
        }

        @TypeConverter
        public static ArrayList<Float> fromStringToFloatList(String value) {
            Type listType = new TypeToken<ArrayList<Float>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromFloatListToString(ArrayList<Float> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<SimpleSensor> fromStringToSimpleSensorList(String value) {
            Type listType = new TypeToken<ArrayList<SimpleSensor>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromSimpleSensorListToString(ArrayList<SimpleSensor> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<Double> fromStringToDoubleList(String value) {
            Type listType = new TypeToken<ArrayList<Double>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromDoubleListToString(ArrayList<Double> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<Project.ProjectRequirement> fromStringToProjectRequirementList(String value) {
            Type listType = new TypeToken<ArrayList<Project.ProjectRequirement>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromProjectRequirementListToString(ArrayList<Project.ProjectRequirement> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static ArrayList<HashMap<String, Object>> fromStringToMapXXList(String value) {
            Type listType = new TypeToken<ArrayList<HashMap<String, Object>>>() {
            }.getType();
            return new Gson().fromJson(value, listType);
        }

        @TypeConverter
        public static String fromMapXXListToString(ArrayList<HashMap<String, Object>> list) {
            Gson gson = new Gson();
            String json = gson.toJson(list);
            return json;
        }

        @TypeConverter
        public static HashMap<String, HashMap<String, String>> fromStringToPrjDetailsHashMap(String val) {
            Type hashmapType = new TypeToken<HashMap<String, HashMap<String, String>>>() {
            }.getType();
            return new Gson().fromJson(val, hashmapType);
        }

        @TypeConverter
        public static String fromPrjDetailsHashMapToString(HashMap<String, HashMap<String, String>> hm) {
            Gson gson = new Gson();
            String json = gson.toJson(hm);
            return json;
        }

        @TypeConverter
        public static InFundingAccount fromStringToInFundingAccount(String val) {
            Type hashmapType = new TypeToken<InFundingAccount>() {
            }.getType();
            return new Gson().fromJson(val, hashmapType);
        }

        @TypeConverter
        public static String fromInFundingAccountToString(InFundingAccount hm) {
            Gson gson = new Gson();
            String json = gson.toJson(hm);
            return json;
        }

        @TypeConverter
        public static ArrayList<ParticipantProfile.ParticipantPointStatistics> fromStringToParticipantPointStatistics(String val) {
            Type hashmapType = new TypeToken<ArrayList<ParticipantProfile.ParticipantPointStatistics>>() {
            }.getType();
            return new Gson().fromJson(val, hashmapType);
        }

        @TypeConverter
        public static String fromParticipantPointStatisticsToString(ArrayList<ParticipantProfile.ParticipantPointStatistics> hm) {
            Gson gson = new Gson();
            String json = gson.toJson(hm);
            return json;
        }

        @TypeConverter
        public static ArrayList<RetrieveDataNotification> fromStringToRetrieveDataNotification(String val) {
            Type hashmapType = new TypeToken<ArrayList<RetrieveDataNotification>>() {
            }.getType();
            return new Gson().fromJson(val, hashmapType);
        }

        @TypeConverter
        public static String fromRetrieveDataNotificationToString(ArrayList<RetrieveDataNotification> hm) {
            Gson gson = new Gson();
            String json = gson.toJson(hm);
            return json;
        }
    }
}
