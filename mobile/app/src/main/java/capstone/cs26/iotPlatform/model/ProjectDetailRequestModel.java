package capstone.cs26.iotPlatform.model;

import android.content.Context;
import android.hardware.Sensor;
import android.util.Log;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.util.SensorUtil;

public class ProjectDetailRequestModel {
    String projectId;

    public ProjectDetailRequestModel(String projectId) {
        this.projectId = projectId;
    }

    public void request(Context context) {
        HttpUtil.post(URLs.GetProjectDetailUrl(), this, Project.class, response -> {
            Log.e("GotPrjDetail", "Got prj detail of " + response._id);
            response.projectId = response._id;
            AppDatabase appDatabase = AppDatabase.getInstance(context);
            AppDatabase.databaseWriteExecutor.execute(() -> {
                FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();
                if (user != null) {
                    appDatabase.projectDao().upsert(response);
                    String currParticipantId = user.getEmail();
                    appDatabase.participantNotificationsDao().upsertPrjDetails(projectId, response.prjTitle, response.prjDescription,
                            currParticipantId);
                }
            });
        }, context);
    }

    public void requestAndCheckSensorSettings(Context context) {
        HttpUtil.post(URLs.GetProjectDetailUrl(), this, Project.class, response -> {
            Log.e("GotPrjDetail", "Got prj detail of " + response._id);
            response.projectId = response._id;
            AppDatabase appDatabase = AppDatabase.getInstance(context);
            AppDatabase.databaseWriteExecutor.execute(() -> {
                appDatabase.projectDao().upsert(response);
                String currParticipantId = FirebaseAuth.getInstance().getCurrentUser().getEmail();
                appDatabase.participantNotificationsDao().upsertPrjDetails(projectId, response.prjTitle, response.prjDescription,
                        currParticipantId);


                ParticipantProfile profile =
                        appDatabase.participantProfileDao().getParticipantByEmailNow(currParticipantId);
                updateSensorSettingsToFulfill(context, profile, response);
            });


        }, context);
    }


    private void updateSensorSettingsToFulfill(Context context, ParticipantProfile profile, Project project) {
        if (profile == null || project == null) return;
        ArrayList<Project.ProjectRequirement> requirements = project.getRealPrjRequirements();
        if (requirements == null) return;
        Project.SensorPrjRequirement sensorPrjRequirement = null;
        Iterator<Project.ProjectRequirement> iterator = requirements.iterator();
        while (iterator.hasNext()) {
            Project.ProjectRequirement req = iterator.next();
            if (req.requirementType.equals("SensorPrjRequirement")) {
                sensorPrjRequirement = (Project.SensorPrjRequirement) req;
                break;
            }
        }
        if (sensorPrjRequirement == null || sensorPrjRequirement.sensors == null || sensorPrjRequirement.sensors.size() == 0)
            return;

        Iterator<Project.EachSensorRequirement> eachSensorReqIt = sensorPrjRequirement.sensors.iterator();
        boolean needToUpdate = false;
        ArrayList<SensorConf> parSensorConfs = profile.sensorConfsTemplate;
        while (eachSensorReqIt.hasNext()) {
            Project.EachSensorRequirement req = eachSensorReqIt.next();
            String sensorId = req.sensorId;
            Integer freq = req.minimumFrequency;
            if (parSensorConfs == null) {
                parSensorConfs = new ArrayList<>();
            }
            SensorConf sensorConfToThisReq = null;
            for (int i = 0; i < parSensorConfs.size(); ++i) {
                if (parSensorConfs.get(i).enabledSensorId.equals(sensorId)) {
                    sensorConfToThisReq = parSensorConfs.get(i);
                    break;
                }
            }
            if (sensorConfToThisReq == null) {
                HashMap<String, ArrayList<Sensor>> sensorsInSys = SensorUtil.getSensors(context);
                for (ArrayList<Sensor> sensorsOfType : sensorsInSys.values()) {
                    boolean found = false;
                    for (Sensor sensor : sensorsOfType) {
                        // Check the sensor exists in this machine.
                        if (SensorUtil.getSensorId(sensor).equals(sensorId)) {
                            needToUpdate = true;
                            parSensorConfs.add(new SensorConf(sensorId, freq));
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }

            } else {
                if (freq > sensorConfToThisReq.sensorFrequency) {
                    needToUpdate = true;
                    sensorConfToThisReq.sensorFrequency = freq;
                }
            }
        }
        if (needToUpdate) {
            HttpUtil.post(URLs.GetProfileUrl(), new PostProfileRequestModel(parSensorConfs),
                    ParticipantProfile.class,
                    profileResponse -> {
                        AppDatabase.databaseWriteExecutor.execute(() -> {
                            AppDatabase.getInstance(context).participantProfileDao().upsert(profileResponse);
                        });
                    }, context);
        }
    }
}
