package capstone.cs26.iotPlatform;


import android.os.Build;

import androidx.lifecycle.Lifecycle;
import androidx.test.core.app.ActivityScenario;
import androidx.test.runner.AndroidJUnit4;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.annotation.Config;
import org.robolectric.pluginapi.Sdk;

import capstone.cs26.iotPlatform.activity.WelcomeActivity;

import static androidx.test.espresso.Espresso.*;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;

@RunWith(AndroidJUnit4.class)
//@Config(maxSdk = Build.VERSION_CODES.P)
public class RobolectricExampleTest2 {

    ActivityScenario<WelcomeActivity> welcomeScenario;
    @Before
    public void setUp(){
        welcomeScenario = ActivityScenario.launch(WelcomeActivity.class);
    }

    @Test
    public void test1(){
        // AndroidJUnit4 API
        welcomeScenario.onActivity(activity -> {
            assertThat(activity.bGoToLogin,is(notNullValue()));
            activity.bGoToLogin.performClick();
            assertThat(activity.bGoToLogin,is(notNullValue()));
        });

        // espresso API
        onView(withId(R.id.btn_goto_login)).check(matches(notNullValue()));
    }
}
