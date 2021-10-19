package capstone.cs26.iotPlatform;

import org.junit.Before;
import org.junit.Test;

import capstone.cs26.iotPlatform.activity.LoginActivity;
import capstone.cs26.iotPlatform.activity.RegisterActivity;
//import capstone.cs26.iotPlatform.archive.LoginActivity;

import static org.junit.Assert.*;
import static org.junit.Assert.assertNull;

public class LoginActivityTest {

// Added by Manisha

    /**
     * For the Login Activity the input is not valid if
     *      1. The Email/Password is empty
     *      2. The Email does not exist
     *      3. The password is not correct for the given email
     */

    private LoginActivity LoginActivityTest;

    @Before
    public void setUp() throws Exception {
        LoginActivityTest = new LoginActivity();
    }

//    @Test
//    public void testOnCreate() {
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_name));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_email));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_password));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_password_again));
//        assertNull(RegisterActivityTest.findViewById(R.id.spinner_gender));
//        assertNull(RegisterActivityTest.findViewById(R.id.btn_register));
//    }


    //Testcase for Email field
    @Test
    public void isEmailValid1() {
        assertEquals(LoginActivityTest.isEmailValid(""), false);
    }
    @Test
    public void isEmailValid2() {
        assertEquals(LoginActivityTest.isEmailValid("ababababab@gmail.com"), true);
    }

//    @Test
//    public void isEmailValid3() {
//        assertEquals(LoginActivityTest.isEmailValid("fdsagag"), false);
//    }

    // Testcases for Password field
    @Test
    public void isPasswordValid1() {
        assertEquals(LoginActivityTest.isPasswordValid(""),false);
    }
    @Test
    public void isPasswordValid2() {
        assertEquals(LoginActivityTest.isPasswordValid("1234"), true);
    }
//    @Test
//    public void isPasswordValid3() {
//        assertEquals(LoginActivityTest.isPasswordValid("123456"),true);
//    }
//
//    @Test
//    public void checkPasswordMatch1() {
//        assertEquals(LoginActivityTest.checkPasswordMatch("12345678", "12345678"), true);
//    }
//
//    @Test
//    public void checkPasswordMatch2() {
//        assertEquals(LoginActivityTest.checkPasswordMatch("12345678", "123678"), false);
//    }
}
// Code added by Manisha ends


//old code

//private LoginActivity testLogin;
//
//@Before
//public void setUp() throws Exception {
//        testLogin = new LoginActivity();
//        }
//
//@Test
//public void testonCreate() {
////        assertNull(testLogin.etEmail);
////        assertNull(testLogin.etPassword);
////        assertNull(testLogin.bRegister);
////        assertNull(testLogin.gSign);
////        assertNull(testLogin.fAuth);
////        assertNull(testLogin.mGoogleSignInClient);
////        assertNull(testLogin.etPassword);
////        assertNotNull(testLogin.admin);
////        assertNotNull(testLogin.adminpass);
////        assertNotNull(testLogin.RC_SIGN_IN);
//
//        }
//
//@Test
//public void onActivityResult() {
//        }
//
//@Test
//public void onClick() {
//        }
//
//
//        }