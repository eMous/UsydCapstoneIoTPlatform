package capstone.cs26.iotPlatform.model;

public class SensorConf {
    public String enabledSensorId;
    public Integer sensorFrequency;

    public SensorConf(String enabledSensorId, Integer sensorFrequency) {
        this.enabledSensorId = enabledSensorId;
        this.sensorFrequency = sensorFrequency;
    }
}
