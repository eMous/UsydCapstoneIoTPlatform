package capstone.cs26.iotPlatform;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.android.controller.ActivityController;
import org.robolectric.annotation.LooperMode;

import capstone.cs26.iotPlatform.activity.LoginActivity;
import capstone.cs26.iotPlatform.activity.WelcomeActivity;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.core.IsNull.notNullValue;
import static org.junit.Assert.assertThat;
import static org.robolectric.Shadows.shadowOf;

@RunWith(RobolectricTestRunner.class)
@LooperMode(LooperMode.Mode.PAUSED)
public class RobolectricExampleTest {
    ActivityController<WelcomeActivity> welcomeController;
    ActivityController<LoginActivity> loginController;
    @Before
    public void setUp(){
        welcomeController = Robolectric.buildActivity(WelcomeActivity.class);
        welcomeController.create();
//        welcomeController.setup();
//        loginController = Robolectric.buildActivity(LoginActivity.class);
//        loginController.setup();
    }

    @Test
    public void test1(){
        assertThat(welcomeController.get().bGoToLogin,notNullValue());
        assertThat(welcomeController.get().bGoToRegister,notNullValue());
//        welcomeController.get().findViewById(R.id.)
//        xxxEditor.setText("sfakeemail");
//        assert(xxxEditor.haserror)
//                xxxEditor.setText("sfassskeemail");
//        assert(xxxEditor.haserror)
//
//        xxxEditor.setText("sfakeemail");
//        assert(xxxEditor.haserror)
    }

    @Test
    public void loginActivityTest(){
        assertThat(loginController.get().etEmail,notNullValue());
        assertThat(loginController.get().etEmail,notNullValue());
    }
}
