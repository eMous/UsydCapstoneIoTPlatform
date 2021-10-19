package capstone.cs26.iotPlatform.model;

import java.util.List;

public class PostSensingDataRequestModel {
    public PostSensingDataRequestModel(List<SensorRecord> data) {
        this.data = data;
    }

    List<SensorRecord> data;
}
