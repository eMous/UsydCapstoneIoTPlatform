package capstone.cs26.iotPlatform.model;

import androidx.annotation.NonNull;
import androidx.room.ColumnInfo;
import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.ArrayList;

@Entity(tableName = SensorRecord.TABLE_NAME)
public class SensorRecord {
    public static final String TABLE_NAME = "SensorRecord";
    public static final String COLUMN_PK = "id";

    @NonNull
    @PrimaryKey
    public String id;
    @ColumnInfo(name = "sensorName")
    public String sensorName;
    public String sensorId;
    public Integer sensorType;
    @ColumnInfo(name = "sensorValue")
    public ArrayList<Double> sensorValue = new ArrayList<>();

    @ColumnInfo(name = "createDetailedTime")
    public String createDetailedTime;

    @ColumnInfo(name = "createTime")
    public Integer createTime;
    // 22:22 -> 22*3600+22*60

    @ColumnInfo(name = "createWeekDay")
    public Integer createWeekDay;

    @ColumnInfo(name = "createDeviceModel")
    public String createDeviceModel;

    public Integer createAndroidAPI;

    @ColumnInfo(name = "createMobileSystem")
    public String createMobileSystem;

    @ColumnInfo(name = "createDeviceType")
    public String createDeviceType;

    @ColumnInfo(name = "createGeo")
    public ArrayList<Double> createGeo = new ArrayList<>();
    @ColumnInfo(name = "participantGender")
    public Integer participantGender;

    public String participantId;

    @ColumnInfo(name = "projectList")
    public ArrayList<String> projectList = new ArrayList<>();
}
