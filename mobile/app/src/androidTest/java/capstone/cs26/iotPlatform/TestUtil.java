package capstone.cs26.iotPlatform;

import android.content.Context;
import android.util.Log;

import androidx.test.espresso.IdlingRegistry;
import androidx.test.espresso.idling.CountingIdlingResource;
import androidx.test.platform.app.InstrumentationRegistry;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import capstone.cs26.iotPlatform.activity.RegisterActivity;
import capstone.cs26.iotPlatform.test.CurrentUser;

import static androidx.test.espresso.Espresso.onIdle;
import static org.junit.Assert.fail;

public class TestUtil {
    private static final String IDLING_NAME = "IDLING_NAME";
    CountingIdlingResource idlingResource = new CountingIdlingResource(IDLING_NAME);
    public OnCompleteListener onCompleteListener = task -> {
        if (task.isSuccessful()) {
            idlingResource.decrement();
        } else {
            fail("The user was not logged successfully"+task.getException().getMessage());
        }
    };

    public void logoutFirebaseUser() {
        FirebaseAuth firebaseAuth = FirebaseAuth.getInstance();
        if (firebaseAuth != null) {
            FirebaseUser user = firebaseAuth.getCurrentUser();
            if (user != null) {
                firebaseAuth.signOut();
            }
        }
    }

    public void registerFirebaseUser() {
        final Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        int apps = FirebaseApp.getApps(context).size();
        if (apps == 0) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setApiKey(BuildConfig.apiKey)
                    .setApplicationId(BuildConfig.applicationId)
                    .setDatabaseUrl(BuildConfig.databaseUrl)
                    .setProjectId(BuildConfig.projectId)
                    .build();
            FirebaseApp.initializeApp(context, options);
        }
        if (!new CurrentUser().isLogged()) {
            IdlingRegistry.getInstance().register(idlingResource);
            FirebaseAuth.getInstance()
                    .createUserWithEmailAndPassword(RegisterActivity.getSaltString() + "@qq.com", "12345678")
                    .addOnCompleteListener(onCompleteListener);
            idlingResource.increment();

            while (!idlingResource.isIdleNow()){
                sleep(100);
            }
//            onIdle();
        }
    }

    public void loginFirebaseUser() {
        final Context context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        int apps = FirebaseApp.getApps(context).size();
        if (apps == 0) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setApiKey(BuildConfig.apiKey)
                    .setApplicationId(BuildConfig.applicationId)
                    .setDatabaseUrl(BuildConfig.databaseUrl)
                    .setProjectId(BuildConfig.projectId)
                    .build();
            FirebaseApp.initializeApp(context, options);
        }
        if (!new CurrentUser().isLogged()) {
            IdlingRegistry.getInstance().register(idlingResource);
            FirebaseAuth.getInstance().signInWithEmailAndPassword("ok@gmail.com","111111")
                    .addOnCompleteListener(onCompleteListener);
            idlingResource.increment();

            while (!idlingResource.isIdleNow()){
                sleep(100);
            }
//            onIdle();
        }
    }

    public void sleep(long milSeconds){
        try {
            Thread.sleep(milSeconds);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
