package capstone.cs26.iotPlatform.http;

import android.content.Context;
import android.util.Log;
import android.widget.Toast;

import com.android.volley.AuthFailureError;
import com.android.volley.NetworkResponse;
import com.android.volley.ParseError;
import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.RetryPolicy;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.HttpHeaderParser;
import com.android.volley.toolbox.JsonRequest;
import com.google.firebase.auth.GetTokenResult;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.Map;

import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.service.sensor.MasterService;

public class GsonRequestBuilder {
    Context context;
    private final Response.ErrorListener myErrorListener = error -> {
        if (error.networkResponse != null) {
            if (context != null) {
                Toast.makeText(context, new String(error.networkResponse.data),
                        Toast.LENGTH_LONG);
            }
            Log.e("HTTP Error", new String(error.networkResponse.data));
        } else {
            if (context != null) {
                Toast.makeText(context, error.toString(),
                        Toast.LENGTH_LONG);
            }
            Log.e("HTTP Error", error.toString());
        }
    };

    public GsonRequestBuilder(Context context) {
        this.context = context;
    }

    <T, K> GsonRequest buildPost(String url, K inPutObj, Class<T> responseClassType,
                                 Response.Listener<T> listener, Map<String, String> headers) {
        return rawBuildPost(url, inPutObj, responseClassType, listener, myErrorListener, headers);
    }

    private <T, K> GsonRequest rawBuildPost(String url, K inPutObj, Class<T> responseClassType,
                                            Response.Listener<T> listener, Response.ErrorListener errorListener,
                                            Map<String, String> headers) {
        JSONObject jsonRequest = null;
        try {
            jsonRequest = new JSONObject(new Gson().toJson(inPutObj));
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return new GsonRequest(Request.Method.POST, url, responseClassType, headers, jsonRequest, listener,
                errorListener);
    }

    private <T, K> GsonRequest rawBuildGet(String url, K inPutObj, Class<T> responseClassType,
                                           Response.Listener<T> listener, Response.ErrorListener errorListener,
                                           Map<String, String> headers) {
        JSONObject jsonRequest = null;
        try {
            jsonRequest = new JSONObject(new Gson().toJson(inPutObj));
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return new GsonRequest(Request.Method.GET, url, responseClassType, headers, jsonRequest, listener,
                errorListener);
    }

    <T, K> GsonRequest buildGet(String url, K inPutObj, Class<T> responseClassType,
                                Response.Listener<T> listener, Map<String, String> headers) {
        return rawBuildGet(url, inPutObj, responseClassType, listener, myErrorListener, headers
        );
    }

    public class GsonRequest<T> extends JsonRequest<T> {
        private final Gson mGson;
        private final Class<T> mClassType;
        private final Map<String, String> mHeaders;
        private final Response.Listener<T> mListener;
        public JSONObject jsonObject;

        public GsonRequest(int method, String url, Class<T> classType, Map<String, String> headers,
                           JSONObject jsonRequest, Response.Listener<T> listener,
                           Response.ErrorListener errorListener) {
            super(method, url, (jsonRequest == null) ? null : jsonRequest.toString(), listener,
                    errorListener);
            jsonObject = jsonRequest;
            mGson = new Gson();
            mClassType = classType;
            mHeaders = headers;
            mListener = listener;
            this.setRetryPolicy(new RetryPolicy() {

                Integer retryTimes = 1;

                @Override
                public int getCurrentTimeout() {
                    return 50000;
                }

                @Override
                public int getCurrentRetryCount() {
                    return retryTimes;
                }

                @Override
                public void retry(VolleyError error) throws VolleyError {
                    if (error.networkResponse.statusCode == 403) {
                        retryTimes++;
                        if (retryTimes >= 20) {
                            throw error;
                        }
                        MasterService service = MasterService.getInstance();
                        if (service != null) {
                            GetTokenResult result = MasterService.getGetTokenResult();
                            if (result != null) {
                                Map<String, String> existingHeader = getHeaders();
                                existingHeader.put("Authorization", "Bearer " + result.getToken());
                                return;
                            }
                        }
                    }
                }
            });
//            this.setRetryPolicy(new DefaultRetryPolicy(
//                    DefaultRetryPolicy.DEFAULT_TIMEOUT_MS * 2,
//                    DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
//                    DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));
            MainActivity.loadUriForIdlingResource(jsonObject);
        }

        @Override
        public Map<String, String> getHeaders() throws AuthFailureError {
            Map k = super.getHeaders();
            return mHeaders != null ? mHeaders : super.getHeaders();
        }

        @Override
        protected Response<T> parseNetworkResponse(NetworkResponse networkResponse) {
            try {
                String json = new String(networkResponse.data, HttpHeaderParser.parseCharset
                        (networkResponse.headers));
                return Response.success(mGson.fromJson(json, mClassType),
                        HttpHeaderParser.parseCacheHeaders(networkResponse));
            } catch (UnsupportedEncodingException e) {
                return Response.error(new ParseError(e));
            } catch (JsonSyntaxException e) {
                return Response.error(new ParseError(e));
            } finally {
                MainActivity.endLoadForIdlingResource(jsonObject);
            }
        }

        @Override
        protected void deliverResponse(T response) {
            mListener.onResponse(response);
        }
    }
}