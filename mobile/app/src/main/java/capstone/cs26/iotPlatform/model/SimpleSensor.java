package capstone.cs26.iotPlatform.model;

import static capstone.cs26.iotPlatform.util.Conf.SENSOR_ID_JOINER;

public class SimpleSensor {
    public String name;
    public Integer type;
    public String id;

    public SimpleSensor(String name, Integer type) {
        this.name = name;
        this.type = type;
        id = name + SENSOR_ID_JOINER + type.toString();
    }
}
