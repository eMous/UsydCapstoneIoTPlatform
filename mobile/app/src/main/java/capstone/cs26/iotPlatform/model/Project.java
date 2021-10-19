package capstone.cs26.iotPlatform.model;

import android.content.Context;
import android.hardware.Sensor;

import androidx.annotation.NonNull;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.SensorUtil;

@Entity(tableName = Project.TABLE_NAME)
public class Project {
    public static final String TABLE_NAME = "Project";
    public static final String COLUMN_PK = "projectId";
    @NonNull
    @PrimaryKey
    public String projectId;
    public String prjTitle;
    public String prjDescription;
    public Date prjStartTime;
    public Integer prjResearchField;
    public ArrayList<ProjectGoal> prjGoals;
    public Integer desiredParticipantNumber;
    public ArrayList<ProjectStatistic> prjStatistic;
    public String _id;
    public Boolean prjComplete;
    public InFundingAccount inFundingAccount;

    public ArrayList<HashMap<String, Object>> prjRequirements;

    public boolean requireThisSensorNow(String sensorId) {
        if (prjStatistic == null) return false;
        for (ProjectStatistic statistic : prjStatistic) {
            if (statistic.sensorId.equals(sensorId) && statistic.goalNum > statistic.collectedNum) {
                return true;
            }
        }
        return false;
    }


    public static class ProjectGoal {
        public String sensorId;
        public Integer recordsNum;
    }

    public ArrayList<ProjectRequirement> getRealPrjRequirements() {
        ArrayList<ProjectRequirement> ret = new ArrayList<>();
        for (HashMap<String, Object> require : prjRequirements) {
            String type = (String) require.get("requirementType");
            Gson gson = new Gson();
            try {
                ProjectRequirement projectRequirement = (ProjectRequirement) gson.fromJson(gson.toJson(require),
                        Class.forName(Project.class.getName() + "$" + type));
                ret.add(projectRequirement);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            }
        }
        return ret;
    }

    public String getSensorRequiredStr(Context context) {
        StringBuilder retBuilder = new StringBuilder();
        ArrayList<ProjectRequirement> requirements = getRealPrjRequirements();
        for (ProjectRequirement requirement : requirements) {
            if (requirement.requirementType.equals("SensorPrjRequirement")) {
                SensorPrjRequirement snrReq = (SensorPrjRequirement) requirement;
                for (int i = 0; i < snrReq.sensors.size(); ++i) {
                    EachSensorRequirement eachReqL = snrReq.sensors.get(i);
                    Sensor sensor = SensorUtil.getSensor(eachReqL.sensorId, context);
                    if (sensor != null) {
                        retBuilder.append(sensor.getName());
                    } else {
                        retBuilder.append(eachReqL.sensorId + "(Not Found In The Device)");
                    }
                    retBuilder.append("\t\t\t");
                    retBuilder.append("Frequency: " + SensorUtil.FrequencyToString(eachReqL.minimumFrequency));
                    if (i != snrReq.sensors.size() - 1) {
                        retBuilder.append("\n\n");
                    }
                }
            }
        }
        return retBuilder.toString();
    }

    public static class ProjectStatistic {
        public Integer collectedNum;
        public Integer goalNum;
        public String sensorId;
    }

    public static abstract class ProjectRequirement {
        public String requirementType;
        public Integer seriousness;

        abstract public String getText();
    }

    public static class LastGeoPrjRequirement extends ProjectRequirement {
        public GPS gpsPoint;
        public Float number;

        @Override
        public String getText() {
            return "Last Geo Project Requirement\nGPS: " + gpsPoint.lat + " " + gpsPoint.lon + "\n" + "Area: " + number +
                    " meters";
        }
    }

    public static class GPS {
        public Float lat;
        public Float lon;
    }

    public static class MobileSystemPrjRequirement extends ProjectRequirement {
        public ArrayList<String> mobileSystems;

        @Override
        public String getText() {
            return "Mobile System Project Requirement\nMobile Systems: " + mobileSystems.toString();
        }
    }

    public static class MobileDeviceTypePrjRequirement extends ProjectRequirement {
        public ArrayList<String> mobileDeviceTypes;

        @Override
        public String getText() {
            return "Mobile Device Type Project Requirement\nMobile Device Types: " + mobileDeviceTypes.toString();
        }
    }

    public static class AndroidAPIPrjRequirement extends ProjectRequirement {
        public Integer minAPILevel;
        public Integer maxAPILevel;
        public ArrayList<Integer> exclude;

        @Override
        public String getText() {
            String ret = "";
            if (minAPILevel != null) {
                ret += "Android API Project Requirement\nMin API Level: " + minAPILevel.toString();
            }
            if (maxAPILevel != null) {
                ret += "\nMax API Level: " + maxAPILevel;
            }
            if (exclude != null && exclude.size() > 0) {
                ret += "\nExclude: " + exclude.toString();
            }
            return ret;
        }
    }

    public static class SensorPrjRequirement extends ProjectRequirement {
        public ArrayList<EachSensorRequirement> sensors;

        @Override
        public String getText() {
            StringBuilder stringBuilder = new StringBuilder();
            stringBuilder.append("");
            stringBuilder.append("Sensor Project Requirement\n");
            for (int i = 0; i < sensors.size(); ++i
            ) {
                EachSensorRequirement requirement = sensors.get(i);
                stringBuilder.append("Sensor Id: " + requirement.sensorId + "\nFrequency: " + SensorUtil.FrequencyToString(requirement.minimumFrequency));
                if (i != sensors.size() - 1) {
                    stringBuilder.append("\n\n");
                }
            }
            return stringBuilder.toString();
        }
    }

    public static class EachSensorRequirement {
        public String sensorId;
        public Integer minimumFrequency;
    }

    public static class GenderPrjRequirement extends ProjectRequirement {
        public ArrayList<Integer> genders;

        @Override
        public String getText() {
            ArrayList<String> genderStrings = new ArrayList<>();
            for (Integer gender :
                    genders) {
                genderStrings.add(Conf.GetGenderStrByIndex(gender));
            }
            return "Gender Project Requirement\n" + genderStrings.toString();
        }
    }

    public static class DeviceModelPrjRequirement extends ProjectRequirement {
        public ArrayList<String> deviceModels;

        @Override
        public String getText() {
            return "Device Model Project Requirement\ndeviceModels: " + deviceModels.toString();
        }
    }
}
