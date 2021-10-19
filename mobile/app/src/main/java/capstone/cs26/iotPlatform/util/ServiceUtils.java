package capstone.cs26.iotPlatform.util;

import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import capstone.cs26.iotPlatform.service.sensor.MasterService;


public class ServiceUtils {
    public static void serviceRestart(Context context, Class<?> service) {
        context.stopService(new Intent(context, service));
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(new Intent(context.getApplicationContext(), service));
        } else {
            context.startService(new Intent(context, service));
        }
    }

    public static boolean isServiceRunning(Context context, Class<?> serviceClass) {
        ActivityManager manager = (ActivityManager) context.getSystemService(Context.ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo service : manager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.getName().equals(service.service.getClassName())) {
                Log.i("Service status", "Running");
                return true;
            }
        }
        Log.i("Service status", "Not running");
        return false;
    }

    public static void serviceCheck(Context context) {
//        if (!ServiceUtils.isServiceRunning(context, MasterService.class)) {
//            Intent masterServiceIntent = new Intent(context, MasterService.class);
//            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//                context.startForegroundService(masterServiceIntent);
//            } else {
//                context.startService(masterServiceIntent);
//            }
//        }
        if (!ServiceUtils.isServiceRunning(context, MasterService.class)) {
            Intent sensorListenServiceIntent = new Intent(context, MasterService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(sensorListenServiceIntent);
            } else {
                context.startService(sensorListenServiceIntent);
            }
        }
    }
}
