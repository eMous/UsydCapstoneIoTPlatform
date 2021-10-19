package capstone.cs26.iotPlatform.model;

import java.util.ArrayList;

public class PostProfileRequestModel {
    Integer gender;
    String name;
    String deviceModel;
    Integer androidAPI;
    String mobileSystem;
    String mobileDeviceType;
    ArrayList<SensorConf> sensorConfsTemplate;

    public PostProfileRequestModel(int gender, String name) {
        this.gender = gender;
        this.name = name;
    }

    public PostProfileRequestModel(int gender, String name, String deviceModel, int androidAPI, String mobileSystem, String mobileDeviceType) {
        this.gender = gender;
        this.name = name;
        this.deviceModel = deviceModel;
        this.androidAPI = androidAPI;
        this.mobileSystem = mobileSystem;
        this.mobileDeviceType = mobileDeviceType;
    }

    public PostProfileRequestModel(ArrayList<SensorConf> sensorConfsTemplate) {
        this.sensorConfsTemplate = sensorConfsTemplate;
    }
}
