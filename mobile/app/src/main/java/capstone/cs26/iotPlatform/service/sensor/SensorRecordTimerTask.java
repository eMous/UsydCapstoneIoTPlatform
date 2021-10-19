package capstone.cs26.iotPlatform.service.sensor;

import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.util.Log;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.TimerTask;
import java.util.UUID;
import java.util.concurrent.Future;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.SensorRecord;
import capstone.cs26.iotPlatform.util.PrettyDate;
import capstone.cs26.iotPlatform.util.SensorUtil;

public class SensorRecordTimerTask extends TimerTask implements SensorEventListener {
    SensorRecord sensorRecord;
    Sensor sensor;
    SensorManager sensorManager;
    AppDatabase appDatabase;
    String parEmail;
    ParticipantProfile profile;
    MasterService service;
    HashMap<String, Project> projects;
    boolean hasSensed;
    private final String TAG;
    public Integer sensorFrequency;

    public SensorRecordTimerTask(Sensor sensor, SensorManager sensorManager, AppDatabase appDatabase,
                                 String parEmail, MasterService service, HashMap<String, Project> projects, Integer sensorFrequency) {
        this.sensor = sensor;
        this.sensorManager = sensorManager;
        this.appDatabase = appDatabase;
        this.parEmail = parEmail;
        this.service = service;
        this.projects = projects;
        hasSensed = false;
        TAG = "SensorRecordTimerTask";
        this.sensorFrequency = sensorFrequency;
    }

    @Override
    public void run() {
        try {
            hasSensed = false;
            profile = appDatabase.participantProfileDao().getParticipantByEmailNow(parEmail);
            boolean registerResult = sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_NORMAL);
            int timeSleep = 0;
            while (!hasSensed) {
                Thread.sleep(100);
                timeSleep += 100;
                if (timeSleep > 1000) {//000 * 100) {
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            synchronized (this) {
                sensorManager.unregisterListener(this);
                if (sensorRecord != null) {
                    sensorRecord = null;
                }
            }
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        SensorRecord xSensorRecord = new SensorRecord();
        xSensorRecord.id = UUID.randomUUID().toString();
        for (int i = 0; i < event.values.length; i++) {
            xSensorRecord.sensorValue.add((double) event.values[i]);
        }
        Calendar cal = Calendar.getInstance();
        Date now = cal.getTime();
        cal.setTime(now);
        xSensorRecord.createDetailedTime = PrettyDate.toString(now);
        Log.d(TAG, SensorUtil.getSensorId(sensor) + ": " + xSensorRecord.createDetailedTime);

        xSensorRecord.createDeviceModel = profile.deviceModel;
        xSensorRecord.createDeviceType = profile.mobileDeviceType;
        if (service.lon != null && service.lat != null) {
            xSensorRecord.createGeo = new ArrayList<>();
            xSensorRecord.createGeo.add(service.lat);
            xSensorRecord.createGeo.add(service.lon);
        } else {
            xSensorRecord.createGeo = null;
        }
        xSensorRecord.createMobileSystem = profile.mobileSystem;
        xSensorRecord.createTime =
                cal.get(Calendar.HOUR_OF_DAY) * 3600 + cal.get(Calendar.MINUTE) * 60 + cal.get(Calendar.SECOND);
        xSensorRecord.createWeekDay = cal.get(Calendar.DAY_OF_WEEK);
        xSensorRecord.sensorName = sensor.getName();
        xSensorRecord.sensorType = sensor.getType();
        xSensorRecord.sensorId = SensorUtil.getSensorId(sensor);
        xSensorRecord.participantGender = profile.gender;
        xSensorRecord.createAndroidAPI = profile.androidAPI;
        xSensorRecord.participantId = profile.email;
        for (int i = 0; i < profile.projects.size(); ++i) {
            ParticipantProfile.ProjectInParticipantProfile proInPar = profile.projects.get(i);
            if (proInPar.joinTime == null) continue;
            if (proInPar.leaveTime != null) continue;
            if (proInPar.prjStartTime.getTime() > now.getTime()) continue;
            String prjId = profile.projects.get(i).projectId;

            Project prjObj = projects.get(prjId);
            if (prjObj == null || proInPar.requireThisSensorNow(xSensorRecord.sensorId)) {
                xSensorRecord.projectList.add(proInPar.projectId);
            }
        }
        hasSensed = true;
        sensorManager.unregisterListener(this);
        if (xSensorRecord.projectList.size() != 0) {
            AppDatabase.databaseWriteExecutor.execute(() -> {
                synchronized (this) {
                    sensorManager.unregisterListener(this);
                    sensorRecord = xSensorRecord;
                    if (sensorRecord != null) {
                        appDatabase
                                .sensorRecordDao()
                                .insertRecord(sensorRecord);
                        sensorRecord = null;
                    }
                }
            });
        } else {
            // this sensor is not needed anymore
            synchronized (this) {
                String sensorId = SensorUtil.getSensorId(sensor);
                Log.e("remove", sensorId);
                service.sensorTasks.remove(this);
                Future future = service.taskFutures.get(sensorId);
                if (future != null) {
                    service.taskFutures.remove(sensorId);
                    future.cancel(false);
                }
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {

    }
}
