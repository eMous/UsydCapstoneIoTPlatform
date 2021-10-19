package capstone.cs26.iotPlatform.activity;

import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.auth.FirebaseAuth;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import capstone.cs26.iotPlatform.BuildConfig;
import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.PostProfileRequestModel;
import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.ServiceUtils;
import capstone.cs26.iotPlatform.util.Util;

import static capstone.cs26.iotPlatform.activity.WelcomeActivity.REQUEST_LOGIN;

public class RegisterActivity extends AppCompatActivity implements View.OnClickListener {
    final static String TAG = "RegisterActivity";

    final static int REGISTER_AND_LOGIN_SUCCESS_RESULT = 999;

    public EditText etEmail;
    public EditText etName;
    public EditText etPassword;
    public EditText etPasswordAgain;
    public Spinner spGender;
    public Button btnRegister;
    public Button btnGoToLogin;
    public ProgressBar progressBar;

    // -------- Error String Begin --------
    private static final String PASSWORD_NOT_MATCH = "The password doesn't match.";
    private static final String PASSWORD_EMPTY = "The password can not be empty.";
    private static final String PASSWORD_TOO_SHORT = "The password should be at least 6 length.";
    private static final String NAME_EMPTY = "The name can not be empty.";
    private static final String EMAIL_EMPTY = "The email can not be empty.";
    private static final String EMAIL_INVALID = "Please provide a valid email.";
    private static final String GENDER_INVALID = "Please select a gender.";
    // -------- Error String End --------

    // -------- Password & Password again Begin --------
    private final TextWatcher passwordEditChangeListener = new TextWatcher() {
        @Override
        public void beforeTextChanged(CharSequence s, int start, int count, int after) {
        }

        @Override
        public void onTextChanged(CharSequence s, int start, int before, int count) {
        }

        @Override
        public void afterTextChanged(Editable s) {
            AfterPasswordTextChanged(s);
        }
    };

    private void AfterPasswordTextChanged(Editable s) {
        allFieldValidate();
    }

    // -------- Password & Password again End --------
    // -------- Email Begin --------
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


    private void AfterEmailTextChanged(Editable s) {
        allFieldValidate();
    }
    // -------- Email End --------

    private boolean allFieldValidate() {
        boolean ret = true;
        etName.setError(null);
        String nameStr = etName.getText().toString().trim();
        StringBuilder stringBuilder = new StringBuilder();
        boolean nameValid = Util.checkName(nameStr, stringBuilder);
        if (!nameValid) {
            etName.setError(stringBuilder.toString());
            return false;
        }

        etEmail.setError(null);
        String emailStr = etEmail.getText().toString().trim();
        boolean emailValid = Util.checkEmail(emailStr, stringBuilder);
        if (!emailValid) {
            etEmail.setError(stringBuilder.toString());
            return false;
        }

        etPassword.setError(null);
        String passwordStr = etPassword.getText().toString().trim();
        boolean passwordFormatValid = Util.checkPasswordFormat(passwordStr, stringBuilder);
        if (!passwordFormatValid) {
            etPassword.setError(stringBuilder.toString());
            return false;
        }

        etPasswordAgain.setError(null);
        String passwordAgainStr = etPasswordAgain.getText().toString().trim();
        boolean passwordAgainValid = Util.checkPasswordMatch(passwordStr, passwordAgainStr, stringBuilder);
        if (!passwordAgainValid) {
            etPasswordAgain.setError(stringBuilder.toString());
            return false;
        }

        if (spGender.getSelectedItemPosition() == 0) {
            ret = false;
        }
        return ret;
    }

    private void initUIs() {
        etEmail = findViewById(R.id.edit_email);
        etName = findViewById(R.id.edit_name);
        etPassword = findViewById(R.id.edit_password);
        etPasswordAgain = findViewById(R.id.edit_password_again);
        spGender = findViewById(R.id.spinner_gender);
        btnRegister = findViewById(R.id.btn_register);
        btnGoToLogin = findViewById(R.id.btn_goto_login);

        progressBar = findViewById(R.id.progressBarSignUp);

        btnRegister.setOnClickListener(this);
        btnGoToLogin.setOnClickListener(this);

        etPassword.addTextChangedListener(passwordEditChangeListener);
        etPasswordAgain.addTextChangedListener(passwordEditChangeListener);

        etEmail.addTextChangedListener(emailEditChangeListener);


        ArrayList<String> list = new ArrayList<>(Arrays.asList(Conf.GENDER_DEFAULT, Conf.GENDER_MALE_STR, Conf.GENDER_FEMALE_STR, Conf.GENDER_SECRET_STR));
        ArrayAdapter<String> adp = new ArrayAdapter<String>(this, android.R.layout.simple_spinner_dropdown_item, list) {
            @Override
            public boolean isEnabled(int position) {
                // Disable the first item from Spinner
                // First item will be use for hint
                return position != 0;
            }

            @Override
            public View getDropDownView(int position, View convertView,
                                        ViewGroup parent) {
                View view = super.getDropDownView(position, convertView, parent);
                TextView gender_default = (TextView) view;
                if (position == 0) {
                    // Set the hint text color gray
                    gender_default.setTextColor(Color.GRAY);
                } else {
                    gender_default.setTextColor(Color.BLACK);
                }
                return view;
            }
        };
        spGender.setAdapter(adp);


        spGender.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selectedStr = (String) spGender.getItemAtPosition(position);
                // If user change the default selection
                // First item is disable and it is used for hint
                if (position > 0) {
                    // Notify the selected item text
//                    Toast.makeText(getApplicationContext(), "Selected : " + selectedStr, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);
        initUIs();
        if (BuildConfig.DEBUG) {
            applyMockData();
        }
    }

    void register() {
        boolean valid = allFieldValidate();
        if (!valid) return;
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String participantName = etName.getText().toString().trim();

        int genderIndex = Conf.GetGenderIndexByStr((String) spGender.getSelectedItem());

        progressBar.setVisibility(View.VISIBLE);

        FirebaseAuth.getInstance().createUserWithEmailAndPassword(email, password).addOnCompleteListener(result -> {
            if (result.isSuccessful()) {
                PostProfileRequestModel postProfileRequestModel = new PostProfileRequestModel(genderIndex,
                        participantName, Build.MANUFACTURER, android.os.Build.VERSION.SDK_INT, "Android",
                        Conf.isWatch(this) ? Conf.WEARABLE_DEVICE_STR : Conf.MOBILE_PHONE_STR);
                Log.e(TAG, "Ready to register");
                HttpUtil.post(URLs.GetProfileUrl(), postProfileRequestModel, ParticipantProfile.class, profileResponse -> {
                    Log.e(TAG, "Register callback");

                    // It means we register a firebase account AND we update our profile information
                    // We need to store the profile information into db first
                    AppDatabase.getInstance(this).databaseWriteExecutor.execute(() -> {
                        AppDatabase.getInstance(this).participantProfileDao().upsert(profileResponse);
                    });
                    // We need to remember the login info
                    SharedPreferences sharedPreferences =
                            getSharedPreferences(LoginActivity.SHARED_PREFERENCE_KEY_USER_INFO,
                                    MODE_PRIVATE);
                    SharedPreferences.Editor editor = sharedPreferences.edit();
                    editor.putString(LoginActivity.MAP_KEY_LAST_EMAIL, email);
                    editor.putString(LoginActivity.MAP_KEY_LAST_PASSWORD, password);
                    editor.putString(LoginActivity.MAP_KEY_PREFIX_OF_PASSWORD + email, password);
                    editor.commit();
                }, RegisterActivity.this);
                // We need to go to the profile activity
                startActivity(new Intent(this, MainActivity.class));
                setResult(REGISTER_AND_LOGIN_SUCCESS_RESULT);
                finish();
            } else {
                Toast.makeText(RegisterActivity.this, "Error !" + result.getException().getMessage(), Toast.LENGTH_SHORT).show();
                progressBar.setVisibility(View.INVISIBLE);
            }
        });
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.btn_register:
                register();
                break;
            case R.id.btn_goto_login:
                startActivityForResult(new Intent(this, LoginActivity.class), REQUEST_LOGIN);
                break;
            default:
                Log.e(TAG, "Onclick v.id = " + v.getId());
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == LoginActivity.LOGIN_SUCCESS_RESULT) {
            setResult(LoginActivity.LOGIN_SUCCESS_RESULT);
            finish();
            return;
        }
    }


    public static String getSaltString() {
        String SALTCHARS = "abcdefghijklmnopqrstuvwxyz";
        StringBuilder salt = new StringBuilder();
        Random rnd = new Random();
        while (salt.length() < 6) { // length of the random string.
            int index = (int) (rnd.nextFloat() * SALTCHARS.length());
            salt.append(SALTCHARS.charAt(index));
        }
        String saltStr = salt.toString();
        return saltStr;
    }

    protected void applyMockData() {
        byte[] array = new byte[7]; // length is bounded by 7
        new Random().nextBytes(array);
        String name = getSaltString();
        String email = name + "@qq.com";
        String pwd = "111111";
        List<Integer> givenList = Arrays.asList(Conf.GENDER_MALE_INT, Conf.GENDER_FEMALE_INT, Conf.GENDER_SECRET_INT);
        Random rand = new Random();
        int gender = givenList.get(rand.nextInt(givenList.size()));

        etEmail.setText(email);
        etName.setText(name);
        etPassword.setText(pwd);
        etPasswordAgain.setText(pwd);
        spGender.setSelection(gender);
        allFieldValidate();
    }

    @Override
    protected void onResume() {
        super.onResume();
        ServiceUtils.serviceCheck(this);
    }
}

