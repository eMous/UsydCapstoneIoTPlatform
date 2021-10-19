package capstone.cs26.iotPlatform.model;

import android.hardware.Sensor;

import java.util.ArrayList;
import java.util.List;

import static android.hardware.Sensor.REPORTING_MODE_CONTINUOUS;

public class LoginRequestModel {
    String fcmToken;
    ArrayList<SimpleSensor> sensors = new ArrayList<>();

    public LoginRequestModel(String fcmToken, List<Sensor> sysSensors) {
        this.fcmToken = fcmToken;
        for (Sensor sensor : sysSensors
        ) {
            if (sensor.getReportingMode() == REPORTING_MODE_CONTINUOUS) {
                sensors.add(new SimpleSensor(sensor.getName(), sensor.getType()));
            }
        }
    }
}
