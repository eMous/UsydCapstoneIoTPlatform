package capstone.cs26.iotPlatform;

import androidx.test.core.app.ActivityScenario;
import androidx.test.espresso.IdlingRegistry;
import androidx.test.espresso.idling.net.UriIdlingResource;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import capstone.cs26.iotPlatform.activity.LoginActivity;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.activity.RegisterActivity;
import capstone.cs26.iotPlatform.activity.WelcomeActivity;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.clearText;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.closeSoftKeyboard;
import static androidx.test.espresso.action.ViewActions.swipeUp;
import static androidx.test.espresso.action.ViewActions.typeText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.hasErrorText;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.isEnabled;
import static androidx.test.espresso.matcher.ViewMatchers.withContentDescription;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;

// Check the UI interactions
public class UIAndroidFunctionalTest {
    UriIdlingResource resource;
    TestUtil testUtil;

    @Before
    public void setUp() {
        testUtil = new TestUtil();
        resource = MainActivity.getIdlingResource();
        IdlingRegistry.getInstance().register(resource);
    }

    @Test
    public void welcomeToLogin() {
        testUtil.logoutFirebaseUser();
        ActivityScenario<WelcomeActivity> welcomeActivity = ActivityScenario.launch(WelcomeActivity.class);
        welcomeActivity.onActivity(activity -> {
        });
        // Click the login button in welcome activity
        onView(withText(containsString("LOGIN"))).perform(click());
        // Check it navigated to the login activity
        onView(withId(R.id.btn_login)).check(matches(isDisplayed()));
    }

    @Test
    public void welcomeToRegister() {
        testUtil.logoutFirebaseUser();
        ActivityScenario<WelcomeActivity> welcomeActivity = ActivityScenario.launch(WelcomeActivity.class);
        welcomeActivity.onActivity(activity -> {
        });
        // Click the signup button in welcome activity
        onView(withText(containsString("SIGNUP"))).perform(click());
        // Check it navigated to the register activity
        onView(withId(R.id.btn_register)).check(matches(isDisplayed()));
    }

    @Test
    public void loginToRegister() {
        testUtil.logoutFirebaseUser();
        ActivityScenario<LoginActivity> loginActivity = ActivityScenario.launch(LoginActivity.class);
        loginActivity.onActivity(activity -> {
        });
        // Click the signup button in login activity
        onView(withText(containsString("SIGNUP"))).perform(click());
        // Check it navigated to the register activity
        onView(withId(R.id.btn_register)).check(matches(isDisplayed()));
    }

    @Test
    public void RegisterToLogin() {
        testUtil.logoutFirebaseUser();
        ActivityScenario<RegisterActivity> registerActivity = ActivityScenario.launch(RegisterActivity.class);
        registerActivity.onActivity(activity -> {
        });
        // Click the signup button in login activity
        onView(withText(containsString("LOGIN"))).perform(click());
        // Check it navigated to the register activity
        onView(withId(R.id.btn_login)).check(matches(isDisplayed()));
    }

    @Test
    public void welcomeWithCurrentUser() {
        testUtil.logoutFirebaseUser();
        testUtil.registerFirebaseUser();
        ActivityScenario<WelcomeActivity> welcomeActivity = ActivityScenario.launch(WelcomeActivity.class);

        // Hack for current server-down situation
        IdlingRegistry.getInstance().unregister(resource);
        testUtil.sleep(1000);
        // Check it automatically navigate to the MainActivity
        onView(withText(containsString("Tier"))).check(matches(isDisplayed()));
    }

    @Test
    public void registerWrongEmail() {
        ActivityScenario<RegisterActivity> registerActivity = ActivityScenario.launch(RegisterActivity.class);

        onView(withId(R.id.edit_email)).perform(clearText()).perform(typeText("hello")).check(matches(hasErrorText(containsString(
                "valid email"))));
    }

    @Test
    public void registerWrongPassword() {
        ActivityScenario<RegisterActivity> registerActivity = ActivityScenario.launch(RegisterActivity.class);

        onView(withId(R.id.edit_password)).perform(clearText()).perform(typeText("1111")).check(matches(hasErrorText(containsString(
                "less than 6"))));
    }

    @Test
    public void PasswordNotMatchingConfirmPassword() {
        ActivityScenario<RegisterActivity> registerActivity = ActivityScenario.launch(RegisterActivity.class);

        onView(withId(R.id.edit_password_again)).perform(clearText()).perform(typeText("1234567")).check(matches(hasErrorText(containsString(
                "doesn't match"))));
    }

    @Test
    public void profileFragmentClickEdit() {
        testUtil.logoutFirebaseUser();
        testUtil.loginFirebaseUser();
        ActivityScenario<MainActivity> mainActivity = ActivityScenario.launch(MainActivity.class);
        // Hack for current server-down situation
        IdlingRegistry.getInstance().unregister(resource);

        onView(withId(R.id.name)).check(matches(not(isDisplayed())));
        onView(withId(R.id.scrollView)).perform(swipeUp());
        onView(withId(R.id.editBtn)).perform(click());
        onView(withId(R.id.name)).check(matches(isDisplayed()));
    }

    @Test
    public void profileFragmentEditName() {
        testUtil.logoutFirebaseUser();
        testUtil.registerFirebaseUser();
        ActivityScenario<MainActivity> mainActivity = ActivityScenario.launch(MainActivity.class);
        IdlingRegistry.getInstance().unregister(resource);
        onView(withId(R.id.name)).check(matches(not(isDisplayed())));
        onView(withId(R.id.scrollView)).perform(swipeUp());
        onView(withId(R.id.editBtn)).perform(click());
        onView(withId(R.id.name)).check(matches(isDisplayed()));
        onView(withId(R.id.name)).perform(clearText()).perform(typeText("Manisha"));
        onView(withId(R.id.resetBtn)).perform(click());
        onView(withId(R.id.name)).perform(clearText()).perform(typeText("Wadhwa"), closeSoftKeyboard());
        onView(withId(R.id.scrollView)).perform(swipeUp());
        onView(withId(R.id.cancelBtn)).perform(click());
    }

    @Test
    public void SensorSettingsClickOn() {
        testUtil.logoutFirebaseUser();
        ActivityScenario<RegisterActivity> registerActivity = ActivityScenario.launch(RegisterActivity.class);
        onView(withId(R.id.btn_register)).perform(click());
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        onView(withContentDescription(R.string.nav_app_bar_open_drawer_description)).perform(click());
        onView(withId(R.id.new_nav_settings)).perform(click());
        onView(withId(R.id.expandable_list_view)).check(matches(isDisplayed()));
        onView(allOf(withId(R.id.tv_sensor_type_name), withText(containsString("pressure")))).perform(click());
        onView(withId(R.id.sw_enable)).perform(click()).check(matches(isEnabled()));
    }


    @After
    public void tearDown() {
        IdlingRegistry.getInstance().unregister(resource);
    }
}
