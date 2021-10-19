package capstone.cs26.iotPlatform.activity;

import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.text.Editable;
import android.text.InputType;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;

import java.util.Map;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.ServiceUtils;

public class LoginActivity extends AppCompatActivity implements View.OnClickListener {
    final static String TAG = "LoginActivity";
    final static int LOGIN_SUCCESS_RESULT = 999;
    public EditText etEmail;
    public EditText etPassword;
    public CheckBox ckRememberMe;
    public Button bGoToForgotPassword;
    public Button bLogin;
    public Button bGoToRegister;
    public Button bSwitchServer;
    public TextView tvLoginTitle;

    int clickTimes = 0;

    // -------- Remembered User Info End --------
    static public final String SHARED_PREFERENCE_KEY_USER_INFO = "LastLogin";
    private Map<String, String> rememberedUsersInfoMap;
    static public final String MAP_KEY_LAST_EMAIL = "LastEmail";
    static public final String MAP_KEY_LAST_PASSWORD = "LastPassword";
    static public final String MAP_KEY_PREFIX_OF_PASSWORD = "Email_"; // For all remembered users:
    private final TextWatcher emailEditChangeListener = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
        }

        @Override
        public void afterTextChanged(Editable s) {
            AfterEmailTextChanged(s);
        }
    };
    private final String fakePassword = "I_AM_FAKE_PASSWORD";
    private String rememberedPassword;

    // -------- Remembered User Info End --------


    private void initUIs() {
        etEmail = findViewById(R.id.editTextTextEmailAddress);
        etPassword = findViewById(R.id.editTextTextPassword);
        ckRememberMe = findViewById(R.id.checkBoxRememberMe);

        bGoToForgotPassword = findViewById(R.id.btn_goto_forgot_password);
        bLogin = findViewById(R.id.btn_login);
        bGoToRegister = findViewById(R.id.btn_goto_register);
        bSwitchServer = findViewById(R.id.btn_switch_server);

        tvLoginTitle = findViewById(R.id.loginTitle);

        bGoToForgotPassword.setOnClickListener(this);
        bLogin.setOnClickListener(this);
        bGoToRegister.setOnClickListener(this);
        ckRememberMe.setOnClickListener(this);
        bSwitchServer.setOnClickListener(this);

        tvLoginTitle.setOnClickListener(this);

        etEmail.addTextChangedListener(emailEditChangeListener);
        etPassword.setOnFocusChangeListener((v, isFocus) -> {
            if (isFocus && rememberedPassword != null) {
                rememberedPassword = null;
                etPassword.setText(null);
            }
        });
    }

    private void AfterEmailTextChanged(Editable s) {
        String currentEmail = s.toString();
        rememberedPassword = rememberedUsersInfoMap.get(MAP_KEY_PREFIX_OF_PASSWORD + currentEmail);
        etPassword.setText(rememberedPassword == null ? null : fakePassword);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        String msg = intent.getStringExtra(Conf.INTENT_EXTRA_MSG_TO_SHOW);
        if (msg != null) {
            Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
        }

        setContentView(R.layout.activity_login);
        initUIs();
        drawAccordingRemember();
    }

    private void drawAccordingRemember() {
        rememberedUsersInfoMap = (Map<String, String>) getSharedPreferences(SHARED_PREFERENCE_KEY_USER_INFO, MODE_PRIVATE).getAll();
        String lastEmail = rememberedUsersInfoMap.get(MAP_KEY_LAST_EMAIL);
        String lastPassword = rememberedUsersInfoMap.get(MAP_KEY_LAST_PASSWORD);
        if (lastEmail != null && lastPassword != null) {
            etEmail.setText(lastEmail);
            etPassword.setText(fakePassword);
            rememberedPassword = lastPassword;
            ckRememberMe.setChecked(true);
        } else {
            etEmail.setText(null);
            etPassword.setText(null);
            ckRememberMe.setChecked(false);
            rememberedPassword = null;
        }
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onResume() {
        super.onResume();
        ServiceUtils.serviceCheck(this);
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
    }


    public void login() {
        String email = etEmail.getText().toString();
        String password = rememberedPassword == null ? etPassword.getText().toString() : rememberedPassword;
        if (TextUtils.isEmpty(email)) {
            etEmail.setError("Email is Required");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            etPassword.setError("Password is Required");
            return;
        }
        FirebaseAuth.getInstance().signInWithEmailAndPassword(email, password).addOnCompleteListener(
                task -> {
                    if (task.isSuccessful()) {
                        Log.d(TAG, "Logged in Successfully");
                        SharedPreferences preferences = getSharedPreferences(SHARED_PREFERENCE_KEY_USER_INFO, MODE_PRIVATE);
                        SharedPreferences.Editor editor = preferences.edit();
                        if (ckRememberMe.isChecked()) {
                            editor.putString(MAP_KEY_LAST_EMAIL, email);
                            editor.putString(MAP_KEY_LAST_PASSWORD, password);
                            editor.putString(MAP_KEY_PREFIX_OF_PASSWORD + email, password);
                        } else {
                            editor.remove(MAP_KEY_PREFIX_OF_PASSWORD + email);
                            if (rememberedUsersInfoMap.get(MAP_KEY_LAST_EMAIL).equals(email)) {
                                editor.remove(MAP_KEY_LAST_EMAIL);
                                editor.remove(MAP_KEY_LAST_PASSWORD);
                            }
                        }
                        editor.commit();
                        startActivity(new Intent(getApplicationContext(), MainActivity.class));
                        setResult(LOGIN_SUCCESS_RESULT);
                        finish();
                    } else {
                        Toast.makeText(LoginActivity.this, "Error !" + task.getException().getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
    }


    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_login:
                login();
                break;
            case R.id.btn_goto_register:
                startActivityForResult(new Intent(this, RegisterActivity.class), 1);
                break;
            case R.id.btn_goto_forgot_password:
                startActivity(new Intent(this, ForgetPassword.class));
                break;
            case R.id.loginTitle:
                if (bSwitchServer.getVisibility() != View.VISIBLE) {
                    clickTimes++;
                    clickTimes %= 7;
                    if (clickTimes > 0) {
                        Toast toast = Toast.makeText(this, "Click " + (7 - clickTimes) + " times to open the server " +
                                "address " +
                                "setting button.", Toast.LENGTH_SHORT);
                        toast.show();

                        Handler handler = new Handler();
                        handler.postDelayed(new Runnable() {
                            @Override
                            public void run() {
                                toast.cancel();
                            }
                        }, 500);
                    }
                    if (clickTimes == 0) {
                        bSwitchServer.setVisibility(View.VISIBLE);
                    }
                }
                break;
            case R.id.btn_switch_server:
                showSwitchServer();
                break;
            default:
                Log.e(TAG, "Onclick v.id = " + v.getId());
        }
    }
    // created methods for unit Testing

    public boolean isEmailValid(String email) {
        boolean ret = true;
        if (email.isEmpty()) {
            ret = false;
        } else {
            if ((email.contains("@")) && email.endsWith(".com")) {
                ret = true;
            }
        }
        return ret;
    }

    public boolean isPasswordValid(String password) {
        boolean ret = true;
        if (password.isEmpty()) {
            ret = false;
        }
        return ret;
    }

    private void showSwitchServer() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle("IP:Port/Domain Name (e.g. ss.caihuashuai.com:3001)");
        final EditText input = new EditText(this);
        input.setInputType(InputType.TYPE_CLASS_TEXT);
        input.setText("34.151.82.81");
        builder.setView(input);
        builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                URLs.ipOrHost = input.getText().toString();
            }
        });
        builder.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.cancel();
            }
        });
        builder.show();
    }

}