package capstone.cs26.iotPlatform.util;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.util.Log;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static android.hardware.Sensor.REPORTING_MODE_CONTINUOUS;
import static android.hardware.Sensor.STRING_TYPE_POSE_6DOF;

public class SensorUtil {
    private final static String TAG = "SensorUtil";
    static HashMap<Integer, ArrayList<Sensor>> sensorTypeMap;
    public final static Integer FREQUENCY_LOW = 1;
    public static Integer INTERVAL_LOW;
    public final static Integer FREQUENCY_MIDDLE = 2;
    public static Integer INTERVAL_MIDDLE;
    public final static Integer FREQUENCY_HIGH = 3;
    public static Integer INTERVAL_HIGH;


    public static HashMap getSensors(Context context) {
        if (sensorTypeMap == null) {
            sensorTypeMap = new HashMap<>();
            List<Sensor> sensorList =
                    ((SensorManager) context.getSystemService(Context.SENSOR_SERVICE)).getSensorList(Sensor.TYPE_ALL);
            for (int i = 0; i < sensorList.size(); ++i) {
                Sensor sensor = sensorList.get(i);
                if (sensor.getReportingMode() == REPORTING_MODE_CONTINUOUS) {
                    int type = sensor.getType();
                    ArrayList typeSensors = sensorTypeMap.get(type);
                    if (typeSensors == null) {
                        typeSensors = new ArrayList();
                        sensorTypeMap.put(type, typeSensors);
                    }
                    typeSensors.add(sensor);
                }
            }
        }
        return sensorTypeMap;
    }

    public static Integer FrequencyToInterval(Integer i) {
        if (i.equals(FREQUENCY_LOW)) {
            return INTERVAL_LOW;
        }
        if (i.equals(FREQUENCY_MIDDLE)) {
            return INTERVAL_MIDDLE;
        }
        if (i.equals(FREQUENCY_HIGH)) {
            return INTERVAL_HIGH;
        }
        Log.e(TAG, "Bad frequency " + i);
        return INTERVAL_LOW;
    }

    public static String FrequencyToString(Integer i) {
        if (i.equals(FREQUENCY_LOW)) {
            return "Low";
        }
        if (i.equals(FREQUENCY_MIDDLE)) {
            return "Middle";
        }
        if (i.equals(FREQUENCY_HIGH)) {
            return "High";
        }
        Log.e(TAG, "Bad frequency to string " + i);
        return "Unknown";
    }

    public static String getSensorId(Sensor sensor) {
        return sensor.getName() + Conf.SENSOR_ID_JOINER + sensor.getType();
    }

    public static Sensor getSensor(String sensorId, Context context) {
        String[] strings = sensorId.split(Conf.SENSOR_ID_JOINER);
        if (strings.length == 1) return null;
        String name = strings[0];
        Integer type = Integer.parseInt(strings[1]);
        HashMap<Integer, ArrayList<Sensor>> sensors = getSensors(context);
        ArrayList<Sensor> typeSensors = sensors.get(type);
        if (typeSensors == null) return null;
        for (int i = 0; i < typeSensors.size(); ++i) {
            Sensor sensor = typeSensors.get(i);
            if (sensor.getName().equals(name)) {
                return sensor;
            }
        }
        return null;
    }

    public static String getSensorTypeStr(Integer typeId) {
        switch (typeId) {
            case Sensor.TYPE_ACCELEROMETER:
                return Sensor.STRING_TYPE_ACCELEROMETER;
            case Sensor.TYPE_MAGNETIC_FIELD:
                return Sensor.STRING_TYPE_MAGNETIC_FIELD;
            case Sensor.TYPE_ORIENTATION:
                return Sensor.STRING_TYPE_ORIENTATION;
            case Sensor.TYPE_GYROSCOPE:
                return Sensor.STRING_TYPE_GYROSCOPE;
            case Sensor.TYPE_LIGHT:
                return Sensor.STRING_TYPE_LIGHT;
            case Sensor.TYPE_PRESSURE:
                return Sensor.STRING_TYPE_PRESSURE;
            case Sensor.TYPE_TEMPERATURE:
                return Sensor.STRING_TYPE_TEMPERATURE;
            case Sensor.TYPE_PROXIMITY:
                return Sensor.STRING_TYPE_PROXIMITY;
            case Sensor.TYPE_GRAVITY:
                return Sensor.STRING_TYPE_GRAVITY;
            case Sensor.TYPE_LINEAR_ACCELERATION:
                return Sensor.STRING_TYPE_LINEAR_ACCELERATION;
            case Sensor.TYPE_ROTATION_VECTOR:
                return Sensor.STRING_TYPE_ROTATION_VECTOR;
            case Sensor.TYPE_RELATIVE_HUMIDITY:
                return Sensor.STRING_TYPE_RELATIVE_HUMIDITY;
            case Sensor.TYPE_AMBIENT_TEMPERATURE:
                return Sensor.STRING_TYPE_AMBIENT_TEMPERATURE;
            case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
                return Sensor.STRING_TYPE_MAGNETIC_FIELD_UNCALIBRATED;
            case Sensor.TYPE_GAME_ROTATION_VECTOR:
                return Sensor.STRING_TYPE_GAME_ROTATION_VECTOR;
            case Sensor.TYPE_GYROSCOPE_UNCALIBRATED:
                return Sensor.STRING_TYPE_GYROSCOPE_UNCALIBRATED;
            case Sensor.TYPE_SIGNIFICANT_MOTION:
                return Sensor.STRING_TYPE_SIGNIFICANT_MOTION;
            case Sensor.TYPE_STEP_DETECTOR:
                return Sensor.STRING_TYPE_STEP_DETECTOR;
            case Sensor.TYPE_STEP_COUNTER:
                return Sensor.STRING_TYPE_STEP_COUNTER;
            case Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR:
                return Sensor.STRING_TYPE_GEOMAGNETIC_ROTATION_VECTOR;
            case Sensor.TYPE_HEART_RATE:
                return Sensor.STRING_TYPE_HEART_RATE;
//            case Sensor.TYPE_TILT_DETECTOR:
//                return Sensor.STRING_TYPE_TILT_DETECTOR;
//            case Sensor.TYPE_WAKE_GESTURE:
//                return Sensor.STRING_TYPE_WAKE_GESTURE;
//            case Sensor.TYPE_GLANCE_GESTURE:
//                return Sensor.STRING_TYPE_GLANCE_GESTURE;
//            case Sensor.TYPE_PICK_UP_GESTURE:
//                return Sensor.STRING_TYPE_PICK_UP_GESTURE;
//            case Sensor.TYPE_WRIST_TILT_GESTURE:
//                return Sensor.STRING_TYPE_WRIST_TILT_GESTURE;
//            case Sensor.TYPE_DEVICE_ORIENTATION:
//                return Sensor.STRING_TYPE_DEVICE_ORIENTATION;
            case Sensor.TYPE_POSE_6DOF:
                return STRING_TYPE_POSE_6DOF;
            case Sensor.TYPE_STATIONARY_DETECT:
                return Sensor.STRING_TYPE_STATIONARY_DETECT;
            case Sensor.TYPE_MOTION_DETECT:
                return Sensor.STRING_TYPE_MOTION_DETECT;
            case Sensor.TYPE_HEART_BEAT:
                return Sensor.STRING_TYPE_HEART_BEAT;
//            case Sensor.TYPE_DYNAMIC_SENSOR_META:
//                return Sensor.STRING_TYPE_DYNAMIC_SENSOR_META;
            case Sensor.TYPE_LOW_LATENCY_OFFBODY_DETECT:
                return Sensor.STRING_TYPE_LOW_LATENCY_OFFBODY_DETECT;
            case Sensor.TYPE_ACCELEROMETER_UNCALIBRATED:
                return Sensor.STRING_TYPE_ACCELEROMETER_UNCALIBRATED;
            case Sensor.TYPE_HINGE_ANGLE:
                return Sensor.STRING_TYPE_HINGE_ANGLE;
            default:
                return "Unknown";
        }
    }

    public static String getSensorTypeInformation(Integer typeId) {
        switch (typeId) {
            case Sensor.TYPE_ACCELEROMETER:
                return "Measures the acceleration forces acting on the mobile in order to obtain the object's position in space and monitor the object's movement.";
            case Sensor.TYPE_MAGNETIC_FIELD:
                return "Mainly used for creating a compass, this sensor measures the geomagnetic field in three axes.";
            case Sensor.TYPE_ORIENTATION:
                return "Useful for determining device position, this sensor will measure the degrees of rotation that a device makes around all three physical axes.";
            case Sensor.TYPE_GYROSCOPE:
                return "Mainly used for rotation detection, a gyro measures the rate of rotation around each of the device’s axes.";
            case Sensor.TYPE_LIGHT:
                return "A measure of the ambient light level, commonly used to control screen brightness";
            case Sensor.TYPE_PRESSURE:
                return "Measures ambient air pressure, useful for monitoring air pressure changes.";
            case Sensor.TYPE_TEMPERATURE:
                return "This sensor measures the ambient room temperature";
            case Sensor.TYPE_PROXIMITY:
                return "This sensor measures the proximity of an object relative to the view of a screen of a device. It is used for determining whether a handset is being held up to a person’s ear.";
            case Sensor.TYPE_GRAVITY:
                return "Measures, on three axes, the force of gravity applied to a device.";
            case Sensor.TYPE_LINEAR_ACCELERATION:
                return "Measures the acceleration force applied to the three axes excluding the force due to gravity.";
            case Sensor.TYPE_ROTATION_VECTOR:
                return "Measures the orientation of a device by providing the three elements of the device's rotation vector.";
            case Sensor.TYPE_RELATIVE_HUMIDITY:
                return "Measures the live humidity reading at a given temperature to the maximum amount of humidity for air at the same temperature.";
            case Sensor.TYPE_AMBIENT_TEMPERATURE:
                return "Measurea the external temperature of the device as a reference point for the system to make calculations.";
            case Sensor.TYPE_MAGNETIC_FIELD_UNCALIBRATED:
                return "Mainly used for creating a compass, this sensor measures the geomagnetic field in three axes but ignores the hard iron distortion.";
            case Sensor.TYPE_GAME_ROTATION_VECTOR:
                return "Measures the orientation of a device by providing the elements of the device's rotation vector but not using the geomagnetic field.";
            case Sensor.TYPE_GYROSCOPE_UNCALIBRATED:
                return "Information currently not available";
            case Sensor.TYPE_SIGNIFICANT_MOTION:
                return "Detects motion which might lead to a change in the user location.";
            case Sensor.TYPE_STEP_DETECTOR:
                return "Used to count the steps taken by the user. It internally uses Accelerometer sensor.";
            case Sensor.TYPE_STEP_COUNTER:
                return "Used to count the steps taken by the user. It internally uses Accelerometer sensor.";
            case Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR:
                return "Measures the orientation of a device by providing the three elements of the device's rotation vector by using magnetometer.";
            case Sensor.TYPE_HEART_RATE:
                return "Measures your heart rate in Beats per Minute using an optical LED light source and an LED light sensor.";
//            case Sensor.TYPE_TILT_DETECTOR:
//                return Sensor.STRING_TYPE_TILT_DETECTOR;
//            case Sensor.TYPE_WAKE_GESTURE:
//                return Sensor.STRING_TYPE_WAKE_GESTURE;
//            case Sensor.TYPE_GLANCE_GESTURE:
//                return Sensor.STRING_TYPE_GLANCE_GESTURE;
//            case Sensor.TYPE_PICK_UP_GESTURE:
//                return Sensor.STRING_TYPE_PICK_UP_GESTURE;
//            case Sensor.TYPE_WRIST_TILT_GESTURE:
//                return Sensor.STRING_TYPE_WRIST_TILT_GESTURE;
//            case Sensor.TYPE_DEVICE_ORIENTATION:
//                return Sensor.STRING_TYPE_DEVICE_ORIENTATION;
            case Sensor.TYPE_POSE_6DOF:
                return "Information currently not available";
            case Sensor.TYPE_STATIONARY_DETECT:
                return "Information currently not available";
            case Sensor.TYPE_MOTION_DETECT:
                return "Measure how the device is oriented in space and how it accelerates when we move it.";
            case Sensor.TYPE_HEART_BEAT:
                return "Measures your heart rate in Beats per Minute using an optical LED light source and an LED light sensor.";
//            case Sensor.TYPE_DYNAMIC_SENSOR_META:
//                return Sensor.STRING_TYPE_DYNAMIC_SENSOR_META;
            case Sensor.TYPE_LOW_LATENCY_OFFBODY_DETECT:
                return "Information currently not available";
            case Sensor.TYPE_ACCELEROMETER_UNCALIBRATED:
                return "Information currently not available";
            case Sensor.TYPE_HINGE_ANGLE:
                return "Provides a measurement in degrees between two integral parts of the device.";
            default:
                return "Unknown";
        }
    }
}
