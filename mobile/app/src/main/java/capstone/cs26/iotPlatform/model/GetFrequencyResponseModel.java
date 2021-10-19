package capstone.cs26.iotPlatform.model;

import capstone.cs26.iotPlatform.util.SensorUtil;

public class GetFrequencyResponseModel {
    Integer low;
    Integer medium;
    Integer high;

    public void handle() {
        if (low != null && medium != null && high != null) {
            SensorUtil.INTERVAL_LOW = low;
            SensorUtil.INTERVAL_MIDDLE = medium;
            SensorUtil.INTERVAL_HIGH = high;
        }
    }
}
