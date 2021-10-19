package capstone.cs26.iotPlatform.http;

import android.content.Context;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.toolbox.Volley;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.GetTokenResult;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import capstone.cs26.iotPlatform.service.sensor.MasterService;


public class HttpUtil {
    private static final String TAG = "HttpUtil";
    private static RequestQueue queue;

    // This POST method allows you to specify custom headers
    public static <T, K> void post(String url, K inPutObj, Class<T> responseClassType,
                                   Response.Listener<T> listener, Map<String, String> headers, Context context) {
        RequestQueue queue = Volley.newRequestQueue(context);

        GsonRequestBuilder.GsonRequest request = new GsonRequestBuilder(context).buildPost(url, inPutObj,
                responseClassType,
                listener,
                headers);
        queue.add(request);
    }

    // This POST method does not provide any headers, but will definitely have a valid user ID token
    public static <T, K> void post(String url, K inPutObj, Class<T> responseClassType,
                                   Response.Listener<T> listener, Context context) {
        HandlerThread handlerThread = new HandlerThread("Thread for Auth Post");
        handlerThread.start();
        Handler handler = new Handler(handlerThread.getLooper());
        handler.post(() -> {
            waitAuthLogic(handler, url, inPutObj, responseClassType, listener, context, true, 1);
        });
    }

    // GET request with custom headers
    public static <T, K> void get(String url, K inPutObj, Class<T> responseClassType,
                                  Response.Listener<T> listener, Map<String, String> headers, Context context) {
        RequestQueue queue = Volley.newRequestQueue(context);
        GsonRequestBuilder.GsonRequest request = new GsonRequestBuilder(context).buildGet(url, inPutObj, responseClassType, listener,
                headers);
        queue.add(request);
    }

    // GET request with no custom headers, but with valid user ID token
    public static <T, K> void get(String url, K inPutObj, Class<T> responseClassType,
                                  Response.Listener<T> listener, Context context) {
        HandlerThread handlerThread = new HandlerThread("Thread for Auth Get");
        handlerThread.start();
        Handler handler = new Handler(handlerThread.getLooper());
        handler.post(() -> {
            waitAuthLogic(handler, url, inPutObj, responseClassType, listener, context, false, 1);
        });
    }

    private static <T, K> void waitAuthLogic(Handler handler, String url, K inPutObj, Class<T> responseClassType,
                                             Response.Listener<T> listener, Context context, Boolean isPost,
                                             int currentTryTimes) {

        GetTokenResult getTokenResult = MasterService.getGetTokenResult();
        final int timeToDelay = 2000;
        FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();
        if (getTokenResult == null) {
            if (currentTryTimes % 100 == 5) {
                Log.e(TAG, "The idToken hasn't been fetched, operation to " + url + " has been waited to be " +
                        "conducted.");
            }

            if (firebaseAuth != null && firebaseAuth.getCurrentUser() != null) {
                handler.postDelayed(() -> {
                    waitAuthLogic(handler, url, inPutObj, responseClassType, listener, context, isPost, currentTryTimes + 1);
                }, timeToDelay);
            }
            return;
        }

        if ((getTokenResult.getExpirationTimestamp() * 1000) < (new Date().getTime() - 5 * 1000)) {
            MasterService service = MasterService.getInstance();
            if (service != null) service.forceTokenGet();
            if (currentTryTimes > 10) {
                Log.e(TAG, "The idToken has been expired, operation to " + url + " has been waited until a " +
                        "new" +
                        " token got" +
                        " to be " +
                        "conducted.");
            }
            handler.postDelayed(() -> {
                waitAuthLogic(handler, url, inPutObj, responseClassType, listener, context, isPost, currentTryTimes + 1);
            }, timeToDelay);
            return;
        }
        if (!MasterService.getInstance().hasLoginToServer()) {
            if (firebaseAuth != null && firebaseAuth.getCurrentUser() != null) {
                Log.e(TAG, "Wait to login to do more operations..." + url + " " + new Date().toString());
                handler.postDelayed(() -> {
                    waitAuthLogic(handler, url, inPutObj, responseClassType, listener, context, isPost, currentTryTimes + 1);
                }, timeToDelay);
            }
            return;
        }

        exactAuthRequestSend(url, inPutObj, responseClassType, listener, context, isPost);
    }


    private static <K, T> void exactAuthRequestSend(String url, K inPutObj, Class<T> responseClassType,
                                                    Response.Listener<T> listener, Context context,
                                                    boolean isPost) {
        GetTokenResult getTokenResult = MasterService.getGetTokenResult();
        HashMap<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + getTokenResult.getToken());
        RequestQueue queue = getQueue(context);
        GsonRequestBuilder.GsonRequest request = null;
        if (isPost) {
            request = new GsonRequestBuilder(context).buildPost(url, inPutObj, responseClassType, listener,
                    headers);
        } else {
            request = new GsonRequestBuilder(context).buildGet(url, inPutObj, responseClassType, listener,
                    headers);
        }
        queue.add(request);
        final String methodStr = isPost ? "POST" : "GET";
        Log.e(TAG, "Http Request: " + url + "(" + methodStr + ") with Auth Header has been sent.");
    }

    private static void showToast(Context context, String msg) {
        new Handler(Looper.getMainLooper()).post(
                () -> {
                    Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
                }
        );
    }

    private static RequestQueue getQueue(Context context) {
        if (queue == null) {
            queue = Volley.newRequestQueue(context);
        }
        return queue;
    }
}
