package capstone.cs26.iotPlatform.model;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;

@Entity(tableName = ParticipantProfile.TABLE_NAME)
public class ParticipantProfile {
    public static final String TABLE_NAME = "UserProfile";
    public static final String COLUMN_EMAIL = "participant_email";

    @NonNull
    @PrimaryKey
    @ColumnInfo(name = "participant_email")
    public String email;

    @ColumnInfo(name = "participant_name")
    public String name;

    @ColumnInfo(name = "participant_gender")
    public Integer gender;

    @ColumnInfo(name = "total_records_number")
    public Long totalRecordsNumber;

    //    @ColumnInfo(name="life_time")
    public Float lifeTimeWallet;

    @ColumnInfo(name = "project_wallets")
    public ArrayList<ProjectWallet> projectWallets = new ArrayList<>();

    @ColumnInfo(name = "balance")
    public Float balance;

    @ColumnInfo(name = "sensor_confs_templates")
    public ArrayList<SensorConf> sensorConfsTemplate = new ArrayList<>();

    @ColumnInfo(name = "project_ids")
    public ArrayList<ProjectInParticipantProfile> projects = new ArrayList<>();

    @ColumnInfo(name = "device_model")
    public String deviceModel;

    @ColumnInfo(name = "android_api")
    public Integer androidAPI;

    @ColumnInfo(name = "mobile_system")
    public String mobileSystem;

    @ColumnInfo(name = "mobile_device_type")
    public String mobileDeviceType;

    public Date lastSenseDataTime;

    public Integer incentiveTier; // 1 Bronze 2 Silver 3 Gold

    public ArrayList<Double> lastGeo = new ArrayList<>();

    public ArrayList<SimpleSensor> sensorsInDevice = new ArrayList<>();

    public ArrayList<ParticipantPointStatistics> pointStatistics = new ArrayList();

    public boolean isSensorNeeded(String enabledSensorId, HashMap<String, Project> projects, ArrayList<String> needToContributePrjs) {
        if (needToContributePrjs == null) return false;
        if (projects == null) return false;

        for (String prjId : needToContributePrjs) {
            Project prj = projects.get(prjId);
            if (prj == null) continue;
            if (prj.prjStatistic == null) return true;
            for (Project.ProjectStatistic statistic : prj.prjStatistic) {
                if (statistic.sensorId.equals(enabledSensorId)) {
                    if (statistic.collectedNum < statistic.goalNum) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public ProjectInParticipantProfile findProInPar(String prjId) {
        for (ProjectInParticipantProfile xProInPar : projects) {
            if (xProInPar.projectId.equals(prjId)) {
                return xProInPar;
            }
        }
        return null;
    }

    public ProjectWallet findProjectWallet(String prjId) {
        for (ProjectWallet xWallet : projectWallets) {
            if (xWallet.projectId.equals(prjId)) return xWallet;
        }
        return null;
    }

    public boolean inAnyProject() {
        for (ProjectInParticipantProfile proInPar : projects) {
            if (proInPar.leaveTime == null && proInPar.joinTime != null) return true;
        }
        return false;
    }

    public class ProjectInParticipantProfile {
        public Date inviteTime;
        public Date joinTime;
        public Date leaveTime;
        public Date lastSenseDataTime;
        public Date prjStartTime;
        public Boolean prjComplete;
        public ArrayList<SensorConf> sensorConfs;
        public ArrayList<SimpleSensorRecord> sensorRecords;
        public ArrayList<IssueInProjectInParProfile> issues;
        public Boolean isFullRedeemOnly;
        public String projectId;

        public boolean iCanContribute(ParticipantProfile participantProfile, Project project) {
            if (project == null) return true;
            if (project.prjStatistic == null) return true;
            if (participantProfile.sensorConfsTemplate == null) return false;

            for (Project.ProjectStatistic statistic : project.prjStatistic) {
                if (statistic.goalNum > statistic.collectedNum) {
                    String sensorId = statistic.sensorId;
                    for (SensorConf sensorConf : participantProfile.sensorConfsTemplate) {
                        if (sensorConf.enabledSensorId.equals(sensorId)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        public String getRedemptionMode() {
            if (isFullRedeemOnly == null || isFullRedeemOnly) {
                return "Redemption only when Complete";
            } else {
                return "Redemption anytime";
            }
        }

        public boolean requireThisSensorNow(String sensorId) {
            for (SimpleSensorRecord record : sensorRecords) {
                if (sensorId.equals(record.sensorId)) {
                    return record.number < record.required;
                }
            }
            return false;
        }
    }

    public class SimpleSensorRecord {
        public String sensorId;
        public Integer number;
        public Integer required;
    }

    public class IssueInProjectInParProfile {
        Integer issueType;
        String issueMessage;
        String issueCreateDate;
        boolean hasNotifyTheParticipant;
    }

    public boolean pushSensorConf(String sensorId, Integer frequency, Boolean enable) {
        int index = -1;
        for (int i = 0; i < sensorConfsTemplate.size(); ++i) {
            if (sensorConfsTemplate.get(i).enabledSensorId.equals(sensorId)) {
                index = i;
                break;
            }
        }
        if (!enable) {
            if (index == -1) {
                return false;
            }
            sensorConfsTemplate.remove(index);
        } else {
            if (index != -1) {
                sensorConfsTemplate.get(index).sensorFrequency = frequency;
            } else {
                sensorConfsTemplate.add(new SensorConf(sensorId, frequency));
            }
        }
        return true;
    }

    public class ParticipantPointStatistics {
        public Integer year;
        public Integer mth;
        public Integer qtr;
        public Float pointsRedeemed;
        public Float redeemablePointsEarned;
        public Float lifeTimePointsEarned;
    }

    public YearUsed getYearUsed() {
        Integer earliestYear = null;
        Integer latestYear = null;
        YearUsed noYearUsed = new YearUsed(0, null, null);
        if (pointStatistics == null) return noYearUsed;
        Iterator<ParticipantPointStatistics> iterator = pointStatistics.iterator();
        while (iterator.hasNext()) {
            ParticipantProfile.ParticipantPointStatistics statistics = iterator.next();
            if (earliestYear == null) {
                earliestYear = statistics.year;
            } else {
                if (statistics.year < earliestYear) {
                    earliestYear = statistics.year;
                }
            }

            if (latestYear == null) {
                latestYear = statistics.year;
            } else {
                if (statistics.year > latestYear) {
                    latestYear = statistics.year;
                }
            }
        }

        if (earliestYear == null || latestYear == null) return noYearUsed;
        return new YearUsed(latestYear - earliestYear + 1, earliestYear, latestYear);
    }
}
