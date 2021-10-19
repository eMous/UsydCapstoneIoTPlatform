package capstone.cs26.iotPlatform.service.sensor;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.HandlerThread;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleService;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;

import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GetTokenResult;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.LoginRequestModel;
import capstone.cs26.iotPlatform.model.LogoutRequestModel;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.PostSensingDataRequestModel;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.SensorConf;
import capstone.cs26.iotPlatform.model.SensorRecord;
import capstone.cs26.iotPlatform.model.Success;
import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.SensorListenUtil;
import capstone.cs26.iotPlatform.util.SensorUtil;


public class MasterService extends LifecycleService implements LocationListener {
    private static final String TAG = "MasterService";

    public static MutableLiveData<Boolean> mHasLoginToServerLiveData = new MutableLiveData<>(false);
    private FirebaseAuth.IdTokenListener mIdTokenListener;
    private FirebaseUser mCurrentUser;

    public static MasterService instance;
    private Handler mIdTokenHandler;
    private HandlerThread mIdTokenThread;
    private boolean hasServiceNotificationShown = false;

    private MasterService.TokenGetThreadExecutor tokenGetThreadExecutor;

    private SensorManager sensorManager;
    private LocationManager locationManager;
    static private GetTokenResult mGetTokenResult;
    private boolean hasRegisterLocationListener = false;
    private String mFcmToken;

    private ParticipantProfile participantProfile;
    private LiveData<ParticipantProfile> profileLiveData;
    private Observer<ParticipantProfile> profileObserver;

    private ParticipantNotifications parNot;
    private LiveData<ParticipantNotifications> parNotLiveData;
    private Observer<ParticipantNotifications> parNotObserver;

    private HashMap<String, Project> projects = new HashMap<>();
    private HashMap<String, LiveData<Project>> projectLiveDatas = new HashMap<>();
    private HashMap<String, Observer<Project>> projectObservers = new HashMap<>();

    private Handler mNotiCheckHandler;
    private Runnable startTimeChecker;
    private Runnable waitFreq;
    ScheduledExecutorService scheduler;
    public final ArrayList<SensorRecordTimerTask> sensorTasks = new ArrayList<>();
    public final HashMap<String, Future> taskFutures = new HashMap<>();

    boolean isForceTokenGetting = false;

    public Double lon;
    public Double lat;

    public boolean hasLoginToServer() {
        return mHasLoginToServerLiveData.getValue();
    }

    public void forceTokenGet() {
        if (isForceTokenGetting) return;
        isForceTokenGetting = true;
        FirebaseUser firebaseUser = FirebaseAuth.getInstance().getCurrentUser();
        if (firebaseUser != null) {
            firebaseUser.getIdToken(true).addOnCompleteListener(tokenGetThreadExecutor, result -> {
                mGetTokenResult = result.getResult();
                isForceTokenGetting = false;
                Log.d(TAG, "Due to expire, force token get finishes!");
            });
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();

        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        initAuthJobs();
        initSensingJobs();

    }

    private void initAuthJobs() {
        tokenGetThreadExecutor = new MasterService.TokenGetThreadExecutor();
    }

    private void listenLocation() {
        if (ContextCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            if (!hasRegisterLocationListener) {
                locationManager.requestLocationUpdates(
                        locationManager.getBestProvider(new Criteria(), true),
                        Conf.INTERVAL_TO_UPDATE_LOCATION,
                        Conf.DISTANCE_TO_UPDATE_LOCATION, this);
                hasRegisterLocationListener = true;
            }
        }

    }

    private void initSensingJobs() {
        sensorManager = (SensorManager) getApplicationContext().getSystemService(Context.SENSOR_SERVICE);
        scheduler = Executors.newScheduledThreadPool(1);
        mNotiCheckHandler = new Handler(getMainLooper());
        startTimeChecker = () -> {
            if (mGetTokenResult != null) {
                if (hasLoginToServer()) {
                    ArrayList<String> needToContribute = SensorListenUtil.getNeedToContributeProjects(participantProfile,
                            projects);
                    if (needToContribute.size() > 0) {
                        listenLocation();
                        if (sensorTasks.size() == 0) {
                            waitFreq.run();
                        } else {
                            checkUpgradeSensorTasks(needToContribute);
                        }
                        Log.d(TAG, "sendSensorPackageToServer");
                        sendSensorPackageToServer();
                    } else {
                        unregisterLocationListener();
                        mNotiCheckHandler.removeCallbacks(waitFreq);
                        scheduler.shutdown();
                        sensorTasks.clear();
                        taskFutures.clear();
                    }
                }
            }

            mNotiCheckHandler.postDelayed(startTimeChecker, 5000);
        };
        waitFreq = () -> {
            if (SensorUtil.INTERVAL_LOW == null || SensorUtil.INTERVAL_MIDDLE == null || SensorUtil.INTERVAL_HIGH == null) {
                if (mNotiCheckHandler != null) {
                    mNotiCheckHandler.postDelayed(waitFreq, 500);
                    return;
                }
            } else {
                runSensorTasks();
            }
        };
    }

    private void checkUpgradeSensorTasks(ArrayList<String> needToContributePrjs) {
        if (sensorTasks.size() == 0) return;
        if (needToContributePrjs == null || needToContributePrjs.size() == 0) return;
        HashMap<String, Integer> sensorFreq = new HashMap<>();
        for (String prjId : needToContributePrjs) {
            Project project = projects.get(prjId);
            if (project == null) continue;
            ArrayList<Project.ProjectRequirement> realRequirements = project.getRealPrjRequirements();
            if (realRequirements == null || realRequirements.size() == 0) continue;
            for (Project.ProjectRequirement realRequirement : realRequirements) {
                if (realRequirement.requirementType.equals("SensorPrjRequirement")) {
                    for (Project.EachSensorRequirement sensorRequirement :
                            ((Project.SensorPrjRequirement) realRequirement).sensors) {
                        String sensorId = sensorRequirement.sensorId;
                        Integer currentRequiredFreq = sensorRequirement.minimumFrequency;
                        boolean shouldUseCollectThisSensor = false;
                        for (ParticipantProfile.ProjectInParticipantProfile xProInPar : participantProfile.projects) {
                            if (xProInPar.joinTime == null) continue;
                            if (xProInPar.leaveTime != null) continue;
                            if (xProInPar.requireThisSensorNow(sensorId)) {
                                shouldUseCollectThisSensor = true;
                                break;
                            }
                        }
                        if (shouldUseCollectThisSensor) {
                            Integer freq = sensorFreq.get(sensorId);
                            if (freq == null || currentRequiredFreq > freq) {
                                if (SensorUtil.getSensor(sensorId, this) != null) {
                                    sensorFreq.put(sensorId, currentRequiredFreq);
                                }
                            }
                        }
                    }
                    break;
                }
            }
        }

        for (String sensorId : sensorFreq.keySet()) {
            boolean hasSuchTask = false;
            Integer freq = sensorFreq.get(sensorId);
            ListIterator<SensorRecordTimerTask> iterator = sensorTasks.listIterator();
            while (iterator.hasNext()) {
                SensorRecordTimerTask task = iterator.next();
                if (SensorUtil.getSensorId(task.sensor).equals(sensorId)) {
                    hasSuchTask = true;
                    if (freq > task.sensorFrequency) {
                        sensorManager.unregisterListener(task, task.sensor);
                        Future future = taskFutures.get(sensorId);
                        if (future != null) {
                            future.cancel(false);
                            taskFutures.remove(sensorId);
                        }

                        SensorRecordTimerTask newTask = new SensorRecordTimerTask(task.sensor, sensorManager,
                                AppDatabase.getInstance(this), participantProfile.email, this, projects, freq);
                        iterator.set(newTask);
                        int interval = SensorUtil.FrequencyToInterval(freq);
                        Future newFuture = scheduler.scheduleWithFixedDelay(newTask, 2000,
                                interval, TimeUnit.MILLISECONDS);
                        taskFutures.put(sensorId, newFuture);
                    }
                    break;
                }
            }
            if (!hasSuchTask) {
                SensorRecordTimerTask newTask = new SensorRecordTimerTask(SensorUtil.getSensor(sensorId, this),
                        sensorManager,
                        AppDatabase.getInstance(this), participantProfile.email, this, projects, freq);
                iterator.add(newTask);
                int interval = SensorUtil.FrequencyToInterval(freq);
                Future newFuture = scheduler.scheduleWithFixedDelay(newTask, 2000,
                        interval, TimeUnit.MILLISECONDS);
                taskFutures.put(sensorId, newFuture);
            }
        }
    }

    private void unregisterLocationListener() {
        hasRegisterLocationListener = false;
        locationManager.removeUpdates(this);
        lat = null;
        lon = null;
    }

    private void sendSensorPackageToServer() {
        AppDatabase.databaseWriteExecutor.execute(() -> {
            if (participantProfile != null) {
                Date lastSenseDataTime = participantProfile.lastSenseDataTime;
                List<SensorRecord> sensorRecords;
                if (lastSenseDataTime == null) {
                    sensorRecords = AppDatabase.getInstance(this).sensorRecordDao().getRecordsAfterTime(
                            participantProfile.email, 0);
                } else {
                    Long kk = lastSenseDataTime.getTime();
                    sensorRecords =
                            AppDatabase.getInstance(this).sensorRecordDao().getRecordsAfterTime(
                                    participantProfile.email, lastSenseDataTime.getTime());
                }
                if (sensorRecords.size() > 0) {
                    PostSensingDataRequestModel postSensingDataRequestModel =
                            new PostSensingDataRequestModel(sensorRecords);
                    Gson gson = new Gson();
                    int size = gson.toJson(postSensingDataRequestModel).length() * 4;

                    boolean sizeCondition = size > (1024 * 1000 * 3);
                    Date dateNow = new Date();
                    long timeNow = dateNow.getTime();
                    long lastSenseDataMilSeconds = lastSenseDataTime == null ? -1 : lastSenseDataTime.getTime();
                    boolean timeCondition = (timeNow - lastSenseDataMilSeconds) > 1000 * 60; // 1000 * 60 * 3
                    if (sizeCondition || timeCondition) {
                        HttpUtil.post(URLs.GetPostSensingDataUrl(), postSensingDataRequestModel, Success.class,
                                response -> {
                                    if (response.msg != null) {
                                        Toast.makeText(this, response.msg, Toast.LENGTH_SHORT).show();
                                    }
                                    if (response.success) {
                                        return;
                                    }
                                }, this);
                        AppDatabase.databaseWriteExecutor.execute(() -> {
                            AppDatabase.getInstance(this).sensorRecordDao().deleteRecord(sensorRecords);

                            // Hack for not resend when debugging in server
                            ParticipantProfile profile = participantProfile;
                            if (profile != null) {
                                profile.lastSenseDataTime = new Date();
                                AppDatabase.getInstance(this).participantProfileDao().upsert(profile);
                            }
                        });
                    }
                }
            }
        });
    }

    private void runSensorTasks() {
        if (participantProfile == null) return;
        ArrayList<String> needToContributePrjs = SensorListenUtil.getNeedToContributeProjects(participantProfile,
                projects);
        for (int i = 0; i < participantProfile.sensorConfsTemplate.size(); ++i) {
            SensorConf sensorConf = participantProfile.sensorConfsTemplate.get(i);
            if (!participantProfile.isSensorNeeded(sensorConf.enabledSensorId, projects, needToContributePrjs))
                continue;
            Sensor sensor = SensorUtil.getSensor(sensorConf.enabledSensorId, this);
            SensorRecordTimerTask sensingTask = new SensorRecordTimerTask(sensor, sensorManager,
                    AppDatabase.getInstance(this), participantProfile.email, this, projects, sensorConf.sensorFrequency);
            sensorTasks.add(sensingTask);
            if (scheduler.isShutdown() || scheduler.isTerminated()) {
                scheduler = Executors.newScheduledThreadPool(1);
            }
            int interval = SensorUtil.FrequencyToInterval(sensorConf.sensorFrequency);
            ScheduledFuture<?> future = scheduler.scheduleWithFixedDelay(sensingTask, 2000,
                    interval, TimeUnit.MILLISECONDS);
            taskFutures.put(sensorConf.enabledSensorId, future);
        }
    }

    private void showServiceNotification() {
        if (!hasServiceNotificationShown) {
            // have started project
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                startMyOwnForeground();
            else
                startForeground(9999, new Notification());

            hasServiceNotificationShown = true;
        }
    }


    @RequiresApi(Build.VERSION_CODES.O)
    private void startMyOwnForeground() {
        Log.i("IoTPlatform Service", "" + Build.VERSION.SDK_INT + "\t" + Build.VERSION_CODES.O);
        String NOTIFICATION_CHANNEL_ID = "IoTPlatform";
        String channelName = "Background Service For Token Fetch and Sensor Data Collection";
        NotificationChannel chan = new NotificationChannel(NOTIFICATION_CHANNEL_ID, channelName, NotificationManager.IMPORTANCE_NONE);
        chan.setLightColor(Color.BLUE);
        chan.setLockscreenVisibility(Notification.VISIBILITY_PRIVATE);

        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        assert manager != null;
        manager.createNotificationChannel(chan);

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID);
        Notification notification = notificationBuilder.setOngoing(true)
                .setContentTitle("App is running in background")
                .setPriority(NotificationManager.IMPORTANCE_MIN)
                .setCategory(Notification.CATEGORY_SERVICE)
                .build();
        startForeground(9999, notification);
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        super.onStartCommand(intent, flags, startId);

        FirebaseMessaging.getInstance().getToken().addOnCompleteListener(fcmTask -> {
            mFcmToken = fcmTask.getResult();
            showServiceNotification();
            Log.i(TAG, "onStartCommand");
            instance = this;
            Log.d(TAG, "Service Started in thread " + Thread.currentThread().getId());
            if (mIdTokenListener == null) {
                mIdTokenListener = firebaseAuth -> {
                    FirebaseUser currentUser = firebaseAuth.getCurrentUser();
                    // New login
                    if (currentUser != null) {
                        if (mCurrentUser == null) {
                            mCurrentUser = currentUser;
                            initObservers(currentUser);
                            Log.d(TAG, "mAuthStateListener triggered for new user login.");
                            authNewUserLogic();
                            sensorSensingNewUserLogic(currentUser);
                        }
                        Task<GetTokenResult> taskIdToken = mCurrentUser.getIdToken(false);
                        if (taskIdToken.isComplete()) {
                            mGetTokenResult = taskIdToken.getResult();
                            String idToken = mGetTokenResult.getToken();
                            List<Sensor> sensorList =
                                    ((SensorManager) getSystemService(SENSOR_SERVICE)).getSensorList(Sensor.TYPE_ALL);
                            LoginRequestModel loginRequestModel = new LoginRequestModel(mFcmToken, sensorList);
                            HashMap headers = new HashMap();
                            headers.put("Authorization", "Bearer " + idToken);
                            HttpUtil.post(URLs.GetLoginUrl(), loginRequestModel, Success.class, response -> {
                                mIdTokenHandler.post(() -> {
                                    // Make sure this happens in NextTokenGet Thread
                                    if (response.success) {
                                        mHasLoginToServerLiveData.postValue(true);
                                    } else {
                                        // Just wait the receiver register
                                        mIdTokenHandler.postDelayed(() -> {
                                            // Server don't allow to login
                                            Intent backIntent = new Intent(Conf.BROADCAST_FILTER_BACK_TO_LOGIN);
                                            intent.putExtra(Conf.MESSAGE_BACK_TO_LOGIN_MESSAGE_KEY, response.msg);
                                            Log.d(TAG, "Send broadcast in Service to let MainActivity back to LoginActivity");
                                            MasterService.getInstance().sendBroadcast(backIntent);
                                        }, 1000);
                                    }
                                });
                            }, headers, this);
                        }
                    } else {
                        mCurrentUser = null;
                        removeAllNotificationsButService();
                        // logout
                        Log.d(TAG, "mAuthStateListener triggered for user logout out.");
                        authUserNullLogic();
                        sensorSensingUserNullLogic();
                    }
                };
                FirebaseAuth.getInstance().addIdTokenListener(mIdTokenListener);
            }
        });
        return START_STICKY;
    }

    private void removeAllNotificationsButService() {
        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.cancelAll();
    }

    private void authNewUserLogic() {
        cleanService();
        mIdTokenThread =
                new HandlerThread("IdToken_Thread");
        mIdTokenThread.start();
        mIdTokenHandler = new Handler(mIdTokenThread.getLooper());
        tokenGetThreadExecutor.mIdTokenHandler = mIdTokenHandler;
    }

    private void authUserNullLogic() {
        if (mGetTokenResult != null && mFcmToken != null) {
            // This make sure there has to be a previous user
            tellAPIServerLogout();
        }
    }

    private void initObservers(FirebaseUser user) {
        profileLiveData =
                AppDatabase.getInstance(this).participantProfileDao().getParticipantByEmail(user.getEmail());

        profileObserver = profile -> {
            if (profile == null) return;
            participantProfile = profile;
            if (profile.projects == null) return;
            for (ParticipantProfile.ProjectInParticipantProfile xParPrj : profile.projects) {
                String prjId = xParPrj.projectId;
                observerSetForPrj(prjId);
            }
        };
        profileLiveData.observe(this, profileObserver);


        parNotLiveData =
                AppDatabase.getInstance(this).participantNotificationsDao().getParticipantNotificationsByEmail(user.getEmail());
        parNotObserver = parNot -> {
            if (parNot == null) return;

            this.parNot = parNot;
            if (parNot.prjDetails == null) return;
            for (String prjId : parNot.prjDetails.keySet()) {
                if (projectLiveDatas.containsKey(prjId)) continue;
                observerSetForPrj(prjId);
            }
        };
        parNotLiveData.observe(this, parNotObserver);
    }

    private void sensorSensingNewUserLogic(FirebaseUser user) {
        mNotiCheckHandler.removeCallbacks(startTimeChecker);
        mNotiCheckHandler.postDelayed(startTimeChecker, 5000);
    }

    private void observerSetForPrj(String prjId) {
        if (projectLiveDatas.containsKey(prjId)) return;
        LiveData<Project> liveData = AppDatabase.getInstance(this).projectDao().getProjectByProjectId(prjId);
        Observer<Project> observer = prj -> {
            if (prj == null) return;
            if (projects.containsKey(prj._id)) return;
            projects.put(prj._id, prj);
        };
        liveData.observe(this, observer);
        projectLiveDatas.put(prjId, liveData);
        projectObservers.put(prjId, observer);
    }

    private void destroyAllObservers() {
        if (profileObserver != null) {
            profileLiveData.removeObserver(profileObserver);
        }
        profileLiveData = null;
        profileObserver = null;
        participantProfile = null;

        if (parNotObserver != null) {
            parNotLiveData.removeObserver(parNotObserver);
        }
        parNotLiveData = null;
        parNotObserver = null;
        parNot = null;

        for (String prjId : projectObservers.keySet()) {
            Observer<Project> observer = projectObservers.get(prjId);
            if (observer == null) continue;
            LiveData<Project> liveData = projectLiveDatas.get(prjId);
            if (liveData == null) continue;
            liveData.removeObserver(observer);
        }
        projectObservers = new HashMap<>();
        projectLiveDatas = new HashMap<>();
        projects = new HashMap<>();
    }

    private void sensorSensingUserNullLogic() {

        destroyAllObservers();


        mNotiCheckHandler.removeCallbacks(startTimeChecker);
        mNotiCheckHandler.removeCallbacks(waitFreq);

        if (!scheduler.isShutdown()) {
            scheduler.shutdown();
        }
        sensorTasks.clear();
        taskFutures.clear();
        unregisterLocationListener();
    }

    private void tellAPIServerLogout() {
        LogoutRequestModel logoutRequestModel = new LogoutRequestModel(mFcmToken);
        Log.d(TAG, "I am telling API Server I am logging out. Don't send FCM message to this user anymore.");
        HttpUtil.post(URLs.GetLogoutUrl(), logoutRequestModel, Map.class, response -> {
            mIdTokenHandler.post(this::cleanService);
        }, this);
    }

    public static GetTokenResult getGetTokenResult() {
        return mGetTokenResult;
    }

    public void cleanService() {
        if (mIdTokenThread != null) {
            mIdTokenThread.quit();
        }
        mIdTokenThread = null;
        mGetTokenResult = null;
        mIdTokenHandler = null;
        mHasLoginToServerLiveData.postValue(false);
        Log.d(TAG, "Service has been cleaned, mHasLoginToServer = false");
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        scheduler.shutdown();

        cleanService();
        FirebaseAuth.getInstance().removeIdTokenListener(mIdTokenListener);
        mIdTokenListener = null;

        sensorSensingUserNullLogic();
        Log.d(TAG, "Service Destroyed");
    }

    @Override
    public void onLocationChanged(@NonNull Location location) {
        lon = location.getLongitude();
        lat = location.getLatitude();
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(@NonNull String provider) {

    }

    @Override
    public void onProviderDisabled(@NonNull String provider) {

    }

    class TokenGetThreadExecutor implements Executor {
        public Handler mIdTokenHandler;

        @Override
        public void execute(Runnable command) {
            mIdTokenHandler.post(command);
        }
    }

    public static MasterService getInstance() {
        return instance;
    }
}
