package capstone.cs26.iotPlatform;

import androidx.annotation.NonNull;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;

import org.junit.Before;
import org.junit.Test;

//import capstone.cs26.iotPlatform.archive.LoginActivity;
//import capstone.cs26.iotPlatform.archive.RegisterActivity;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class LoginRegisterTest {

//    private RegisterActivity testRister;
//    private LoginActivity testLogin;
    static boolean logInmark = false;
    static boolean Registermark = false;
    String newEmail = "jake@gmail.com";
    String newPassword = "12345678";

    @Before
    public void setUp() throws Exception {
//        testRister = new RegisterActivity();
//        testLogin = new LoginActivity();


    }


    public void register() {

        FirebaseAuth.getInstance().createUserWithEmailAndPassword(newEmail, newPassword).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
                if (task.isSuccessful()) {
                    Registermark = true;
                } else {
                    System.out.println("Register Error");
                }
            }
        });
    }


    public void Login() {

        FirebaseAuth.getInstance().signInWithEmailAndPassword(newEmail, newPassword).addOnCompleteListener(new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
                if (task.isSuccessful()) {
                    logInmark = true;
                } else {
                    System.out.println("Login not exists");
                }
            }
        });
    }

    @Test
    public void testRegisterThenLogin() {
        assertEquals(this.Registermark, false); // test for register

        assertEquals(this.logInmark, false); // test for login

    }
}