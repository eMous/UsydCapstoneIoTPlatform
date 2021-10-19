package capstone.cs26.iotPlatform.activity;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.util.ServiceUtils;
import capstone.cs26.iotPlatform.util.Util;


public class ForgetPassword extends AppCompatActivity {

    public EditText email;
    public Button sendLinkButton;
    public ProgressBar progressBar;

    FirebaseAuth auth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forget_password);

        email = findViewById(R.id.TextEmailAddress);
        sendLinkButton = findViewById(R.id.sendLinkbutton);
        progressBar = findViewById(R.id.progressBar);

        auth = FirebaseAuth.getInstance();

        sendLinkButton.setOnClickListener(v -> sendLink());
    }

    private void sendLink() {
        //converting the email editText to string and trimming if any extra spaces added by user
        String emailStr = email.getText().toString().trim();
        StringBuilder responseBuilder = new StringBuilder();
        boolean validateResult = Util.checkEmail(emailStr, responseBuilder);
        if (!validateResult) {
            email.setError(responseBuilder.toString());
            email.requestFocus();
            return;
        }

        progressBar.setVisibility(View.VISIBLE);

        auth.sendPasswordResetEmail(emailStr).addOnCompleteListener(new OnCompleteListener<Void>() {
            @Override
            public void onComplete(@NonNull Task<Void> task) {
                if (task.isSuccessful()) {
                    Toast.makeText(ForgetPassword.this, "Link Sent. Please check your email.", Toast.LENGTH_SHORT).show();
                    progressBar.setVisibility(View.INVISIBLE);
                    new Handler(Looper.myLooper()).postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            finish();
                        }
                    }, 2000);
                } else {
                    Toast.makeText(ForgetPassword.this, "Please try again!!", Toast.LENGTH_LONG).show();
                    progressBar.setVisibility(View.INVISIBLE);
                }
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        ServiceUtils.serviceCheck(this);
    }
}
