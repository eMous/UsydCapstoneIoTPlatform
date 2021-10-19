package capstone.cs26.iotPlatform;

import androidx.annotation.NonNull;
import androidx.test.core.app.ActivityScenario;
import androidx.test.espresso.action.ViewActions;
import androidx.test.espresso.idling.CountingIdlingResource;
import androidx.test.espresso.intent.rule.IntentsTestRule;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;

import junit.framework.AssertionFailedError;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;

import capstone.cs26.iotPlatform.activity.ForgetPassword;
import capstone.cs26.iotPlatform.activity.LoginActivity;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.activity.RegisterActivity;
import capstone.cs26.iotPlatform.activity.WelcomeActivity;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.endsWith;
import static org.hamcrest.Matchers.isEmptyOrNullString;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;


public class AndroidUIComponentTest {
    TestUtil testUtil;
    private static final String IDLING_NAME = "IDLING_NAME";

    ActivityScenario<WelcomeActivity> welcomeActivity;
    ActivityScenario<LoginActivity> loginActivity;
    ActivityScenario<RegisterActivity> registerActivity;
    ActivityScenario<ForgetPassword> forgetPassword;
    ActivityScenario<MainActivity> mainActivity;


    @Before
    public void setUp() {
        testUtil = new TestUtil();
    }

    @Test
    public void welcomeActivityTest() {
        testUtil.logoutFirebaseUser();
        welcomeActivity = ActivityScenario.launch(WelcomeActivity.class);
        welcomeActivity.onActivity(activity -> {
            assertThat(activity.bGoToLogin, notNullValue());
            assertThat(activity.bGoToRegister, notNullValue());
        });
    }


    @Test
    public void loginActivityTest() {
        testUtil.logoutFirebaseUser();
        loginActivity = ActivityScenario.launch(LoginActivity.class);
        loginActivity.onActivity(activity -> {
            assertThat(activity.ckRememberMe, notNullValue());
            assertThat(activity.bGoToForgotPassword, notNullValue());
            assertThat(activity.bGoToRegister, notNullValue());
            assertThat(activity.bLogin, notNullValue());
        });
    }

//    @Rule
//    public IntentsTestRule<RegisterActivity> intentsTestRule =
//            new IntentsTestRule<>(RegisterActivity.class);

    @Test
    public void RegisterActivityTest() {
        testUtil.logoutFirebaseUser();
        registerActivity = ActivityScenario.launch(RegisterActivity.class);
        registerActivity.onActivity(activity -> {
            assertThat(activity.btnGoToLogin, notNullValue());
            assertThat(activity.btnRegister, notNullValue());
            assertThat(activity.etEmail, notNullValue());
            assertThat(activity.etName, notNullValue());
            assertThat(activity.etPassword, notNullValue());
            assertThat(activity.etPasswordAgain, notNullValue());
            assertThat(activity.spGender, notNullValue());
        });
    }

    @Test
    public void forgetPasswordTest() {
        forgetPassword = ActivityScenario.launch(ForgetPassword.class);
        forgetPassword.onActivity(activity -> {
            assertThat(activity.email.getText().toString(), isEmptyOrNullString());
            assertThat(activity.sendLinkButton, notNullValue());
            assertThat(activity.progressBar, notNullValue());
        });
    }

    @Test
    public void MainActivityTest() {
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            assertThat(activity.mSwipeRefreshLayout, notNullValue());
            assertThat(activity.mAppBarConfiguration, notNullValue());
            assertThat(activity.fragmentManager, notNullValue());
            assertThat(activity.ivNotificationBell, notNullValue());
            assertThat(activity.tvFragmentTitle, notNullValue());
            assertThat(activity.navController, notNullValue());
        });
    }

    @Test
    public void HelpFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_help);
        });
        onView(withText("About us")).check(matches(isDisplayed()));
        onView(withText(endsWith("Information"))).check(matches(isDisplayed()));
        onView(withText(endsWith("of hours."))).check(matches(isDisplayed()));
    }

    @Test
    public void ProfileFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_profile);
        });
        onView(withText(containsString("Tier Status"))).check(matches(isDisplayed()));
        onView(withText(containsString("Email:"))).check(matches(isDisplayed()));
        onView(withText(containsString("Name:"))).check(matches(isDisplayed()));
        onView(withText(containsString("Gender:"))).check(matches(isDisplayed()));
        onView(withText(containsString("Amount of Data"))).check(matches(isDisplayed()));
        onView(withText(containsString("Lifetime Wallet"))).check(matches(isDisplayed()));
        onView(withText(containsString("Balance"))).check(matches(isDisplayed()));
        onView(withText(containsString("Mobile System"))).check(matches(isDisplayed()));
        onView(withText(containsString("Android API"))).check(matches(isDisplayed()));
        onView(withId(R.id.scrollView)).perform(ViewActions.swipeUp());
        onView(withText(containsString("Device Model"))).check(matches(isDisplayed()));
        onView(withText(containsString("EDIT"))).check(matches(isDisplayed()));
    }

    @Test
    public void ProjectListFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_proj_list);
        });

        try {
            onView(withText(containsString("There are"))).check(matches(isDisplayed()));
        } catch (AssertionFailedError e) {
            onView(withId(R.id.projectListRecyclerView)).check(matches(isDisplayed()));
        }
    }

    @Test
    public void NavigationListFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_notifications);
        });

        try {
            onView(withText(containsString("No new Notifications"))).check(matches(isDisplayed()));
        } catch (AssertionFailedError e) {
            onView(withId(R.id.notificationRecyclerView)).check(matches(isDisplayed()));
        }
    }

    @Test
    public void MyRewardsFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_rewards);
        });

        try {
            onView(withText(containsString("have any points"))).check(matches(isDisplayed()));
        } catch (AssertionFailedError e) {
            onView(withText(containsString("Monthly"))).check(matches(isDisplayed()));
            onView(withText(containsString("quarterly"))).check(matches(isDisplayed()));
            onView(withText(containsString("yearly"))).check(matches(isDisplayed()));
            onView(withId(R.id.RewardsTabLayout)).check(matches(isDisplayed()));
            onView(withId(R.id.viewPager)).check(matches(isDisplayed()));
            onView(withId(R.id.tvLifetimePoints)).check(matches(isDisplayed()));
            onView(withId(R.id.tvRedeemablePoints)).check(matches(isDisplayed()));
            onView(withId(R.id.spYearFilter)).check(matches(isDisplayed()));
            onView(withText(containsString("Lifetime Points"))).check(matches(isDisplayed()));
            onView(withText(containsString("Redeemable Points"))).check(matches(isDisplayed()));
            onView(withText(containsString("Redeemable points are earned in projects"))).check(matches(isDisplayed()));
            onView(withId(R.id.pointsInfo)).check(matches(isDisplayed()));
//            onView(withId(R.id.lvPoints)).check(matches(isDisplayed()));
        }
    }

    @Test
    public void SensorSettingsFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_settings);
        });
        try {
            onView(withId(R.id.expandable_list_view)).check(matches(isDisplayed()));
        } catch (AssertionFailedError e) {
            onView(withId(R.id.tv_sensor_type_name)).check(matches(isDisplayed()));
            onView(withId(R.id.iv_sensor_type_info)).check(matches(isDisplayed()));
            onView(withId(R.id.tv_sensor_name)).check(matches(isDisplayed()));
            onView(withId(R.id.sw_enable)).check(matches(isDisplayed()));
            onView(withId(R.id.toggleGroup)).check(matches(isDisplayed()));
            onView(withId(R.id.btn_low)).check(matches(isDisplayed()));
            onView(withId(R.id.btn_medium)).check(matches(isDisplayed()));
            onView(withId(R.id.btn_high)).check(matches(isDisplayed()));
            onView(withText("Frequency")).check(matches(isDisplayed()));
        }
    }

    @Test
    public void DashboardFragmentTest() {
        testUtil.registerFirebaseUser();//setUpFirebase();
        mainActivity = ActivityScenario.launch(MainActivity.class);
        mainActivity.onActivity(activity -> {
            activity.navController.navigate(R.id.new_nav_dashboard);
        });
        try {
            onView(withText(containsString("Hi"))).check(matches(isDisplayed()));
            onView(withId(R.id.summaryCard)).check(matches(isDisplayed()));
        } catch (AssertionFailedError e) {
            onView(withId(R.id.rewardsCard)).check(matches(isDisplayed()));
            onView(withId(R.id.myProjectsCard)).check(matches(isDisplayed()));
            onView(withId(R.id.projectsRecyclerView)).check(matches(isDisplayed()));
        }
    }
}
