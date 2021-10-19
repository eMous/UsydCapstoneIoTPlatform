package capstone.cs26.iotPlatform.activity;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;

import java.net.CookieHandler;
import java.net.CookieManager;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.util.ServiceUtils;

public class WelcomeActivity extends AppCompatActivity implements View.OnClickListener {
    final static String TAG = "WelcomeActivity";
    public Button bGoToLogin;
    public Button bGoToRegister;

    final static int REQUEST_LOGIN = 999;
    final static int REQUEST_REGISTER = 998;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FirebaseApp.initializeApp(this);
        setContentView(R.layout.activity_welcome);
        initUIs();
        CookieManager cookieManager = new CookieManager();
        CookieHandler.setDefault(cookieManager);
    }

    @Override
    protected void onResume() {
        super.onResume();
        ServiceUtils.serviceCheck(this);
    }

    private void initUIs() {
        bGoToLogin = findViewById(R.id.btn_goto_login);
        bGoToRegister = findViewById(R.id.btn_goto_register);

        bGoToLogin.setOnClickListener(this);
        bGoToRegister.setOnClickListener(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.e(TAG, "It has been destroyed.");
    }

    @Override
    protected void onStart() {
        super.onStart();
        // check if already logged in
        if (FirebaseAuth.getInstance().getCurrentUser() != null) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == LoginActivity.LOGIN_SUCCESS_RESULT) {
            // Login login && Register->Login login
            finish();
            return;
        }

        if (resultCode == RegisterActivity.REGISTER_AND_LOGIN_SUCCESS_RESULT && requestCode == REQUEST_REGISTER) {
            finish();
            return;
        }
    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_goto_register:
                startActivityForResult(new Intent(this, RegisterActivity.class), REQUEST_REGISTER);
                break;
            case R.id.btn_goto_login:
                startActivityForResult(new Intent(this, LoginActivity.class), REQUEST_LOGIN);
                break;
            default:
                Log.e(TAG, "Onclick v.id = " + v.getId());
        }
    }
}
