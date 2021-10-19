package capstone.cs26.iotPlatform;

import org.junit.Before;
import org.junit.Test;

import capstone.cs26.iotPlatform.activity.RegisterActivity;
import capstone.cs26.iotPlatform.util.Util;
//import capstone.cs26.iotPlatform.archive.RegisterActivity;

import static org.junit.Assert.*;

public class UtilityFunctionUnitTest {

    // Added by Manisha
    StringBuilder responseStrBuilder;
    @Before
    public void setUp(){
        responseStrBuilder = new StringBuilder();
    }
    @Test
    public void isNameValid() {
        assertEquals(Util.checkName("",responseStrBuilder), false);
    }
    @Test
    public void isNameValid2() {
        assertEquals(Util.checkName("Capstone Project",responseStrBuilder), false);
    }
    @Test
    public void isNameValid3() {
        assertEquals(Util.checkName("Capstone Prj",responseStrBuilder), true);
    }
    @Test
    public void isNameValid4() {
        assertEquals(Util.checkName("Capstone",responseStrBuilder), true);
    }

    //Testcase for Email field
    @Test
    public void isEmailValid1() {
        assertEquals(Util.checkEmail("",responseStrBuilder), false);
    }
    @Test
    public void isEmailValid2() {
        assertEquals(Util.checkEmail("ababababab@gmail.com",responseStrBuilder), true);
    }

    @Test
    public void isEmailValid3() {
        assertEquals(Util.checkEmail("fdsagag",responseStrBuilder), false);
    }

    // Testcases for Password field
    @Test
    public void isPasswordValid1() {
        assertEquals(Util.checkPasswordFormat("",responseStrBuilder), false);
    }
    @Test
    public void isPasswordValid2() {
        assertEquals(Util.checkPasswordFormat("1234",responseStrBuilder), false);
    }
    @Test
    public void isPasswordValid3() {
        assertEquals(Util.checkPasswordFormat("123456",responseStrBuilder), true);
    }

    @Test
    public void checkPasswordMatch1() {
        assertEquals(Util.checkPasswordMatch("12345678","12345678",responseStrBuilder), true);
    }

    @Test
    public void checkPasswordMatch2() {
        assertEquals(Util.checkPasswordMatch("12345678","123678",responseStrBuilder), false);
    }
}