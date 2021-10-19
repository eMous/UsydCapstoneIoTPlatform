package capstone.cs26.iotPlatform.activity.fragment.profile;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import com.google.firebase.auth.FirebaseAuth;

import java.util.ArrayList;
import java.util.Arrays;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.PostProfileRequestModel;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.IRender;

public class ProfileFragment extends Fragment implements View.OnClickListener, IRender {
    static final String TAG = "ProfileFragment";

    MainActivity mainActivity;
    TextView emailText;
    TextView nameText;
    TextView genderText;
    TextView mobileSystemText;
    TextView androidAPIText;
    TextView deviceModelText;
    TextView usersBalanceText;
    TextView usersLifeTimeWallet;
    TextView usersAmountDataText;
    TextView profileTier;
    TextView profileTierInfoTextView;
    View root;
    private Button cancelBtn;
    private Button editBtn;
    private Button resetBtn;
    private String email;
    private String name;
    private Integer gender = 0;
    private String mobileSystem;
    private String androidAPI;
    private String deviceModel;
    private EditText nameEdit;
    private Spinner genderSpinner;

    private void showTheTier(ParticipantProfile participantProfile) {
        Integer tier = participantProfile.incentiveTier;
        if (tier == null || tier == 1) {
            profileTier.setText("BRONZE");
            profileTier.setTextColor(Color.parseColor("#CD7F32"));
            profileTierInfoTextView.setText("Your Lifetime Point multiplier is currently at a rate of 1.0x.");
            return;
        }
        if (tier == 2) {
            profileTier.setText("SILVER");
            profileTier.setTextColor(Color.parseColor("#C0C0C0"));
            profileTierInfoTextView.setText("Your Lifetime Point multiplier is currently at a rate of 1.5x.");
            return;
        }
        if (tier == 3) {
            profileTier.setText("GOLD");
            profileTier.setTextColor(Color.parseColor("#FFD700"));
            profileTierInfoTextView.setText("Your Lifetime Point multiplier is currently at a rate of 2.0x.");
        }
    }

    @Override
    public void onAttach(@NonNull Context context) {
        super.onAttach(context);
        Log.e(TAG, "onAttach");
    }

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        mainActivity = (MainActivity) getActivity();

        root = inflater.inflate(R.layout.fragment_profile, container, false);
        Log.e(TAG, "onCreated");
        initUI();
        return root;
    }


    @Override
    public void onResume() {
        super.onResume();
        mainActivity.cachedModels.registerCurrentFragment(this);
        ((MainActivity) getActivity()).setFragmentTitle("Profile");
        ((MainActivity) getActivity()).enableSwipeRefresh(false);
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    @Override
    public void onPause() {
        super.onPause();
        ((MainActivity) getActivity()).cachedModels.removeCurrentFragment(this);
    }

    public void initUI() {
        emailText = root.findViewById(R.id.usersEmail);
        nameText = root.findViewById(R.id.usersName);
        profileTier = root.findViewById(R.id.profileTier);
        profileTierInfoTextView = root.findViewById(R.id.profileTierInfoTextView);
        genderText = root.findViewById(R.id.usersGender);
        mobileSystemText = root.findViewById(R.id.usersMobileSystem);
        androidAPIText = root.findViewById(R.id.usersAndroidAPI);
        deviceModelText = root.findViewById(R.id.usersDeviceModel);
        usersBalanceText = root.findViewById(R.id.usersBalance);
        usersLifeTimeWallet = root.findViewById(R.id.usersLifetimeWallet);
        usersAmountDataText = root.findViewById(R.id.usersDataAmount);
        nameEdit = root.findViewById(R.id.name);
        genderSpinner = root.findViewById(R.id.gender);
        editBtn = root.findViewById(R.id.editBtn);
        cancelBtn = root.findViewById(R.id.cancelBtn);
        resetBtn = root.findViewById(R.id.resetBtn);

        editBtn.setOnClickListener(this);
        cancelBtn.setOnClickListener(this);
        resetBtn.setOnClickListener(this);

        ArrayList<String> list = new ArrayList<>(Arrays.asList(Conf.GENDER_DEFAULT, Conf.GENDER_MALE_STR, Conf.GENDER_FEMALE_STR, Conf.GENDER_SECRET_STR));
        ArrayAdapter<String> adp = new ArrayAdapter<String>(getContext(), android.R.layout.simple_spinner_dropdown_item, list) {
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
        genderSpinner.setAdapter(adp);


        genderSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {


            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                String selectedStr = (String) genderSpinner.getItemAtPosition(position);
                // If user change the default genderSpinner
                // First item is disable and it is used for hint
                if (position > 0) {
                    // Notify the selected item text
                    Toast.makeText(getContext(), "Selected : " + selectedStr, Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        render(mainActivity.cachedModels);
    }

    @Override
    public void onStart() {
        super.onStart();
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {

            case R.id.editBtn:
                if (editBtn.getText().equals("Edit")) {
                    editBtnOnClick();
                } else {
                    saveBtnOnClick();
                }
                break;
            case R.id.cancelBtn:
                cancelBtnOnClick();
                break;
            case R.id.resetBtn:
                resetBtnOnClick();
                break;
        }
    }

    public boolean checkNameLength(String name) {
        return name.length() != 0 && name.length() <= 12;
    }

    public boolean checkGender(String gender) {
        return gender.length() <= 30;
    }

    private void cancelBtnOnClick() {
        nameEdit.setVisibility(View.INVISIBLE);
        genderSpinner.setVisibility(View.INVISIBLE);
        // restore to original value
        nameEdit.setText(name);
        nameEdit.setError(null);
        genderSpinner.setSelection(gender);
        emailText.setVisibility(View.VISIBLE);
        nameText.setVisibility(View.VISIBLE);
        genderText.setVisibility(View.VISIBLE);
        mobileSystemText.setVisibility(View.VISIBLE);
        androidAPIText.setVisibility(View.VISIBLE);
        deviceModelText.setVisibility(View.VISIBLE);
        editBtn.setText("Edit");
        cancelBtn.setVisibility(View.INVISIBLE);
        resetBtn.setVisibility(View.INVISIBLE);
    }

    private void saveBtnOnClick() {
        String newName = String.valueOf(nameEdit.getText());
        Integer newGender = Conf.GetGenderIndexByStr((String) genderSpinner.getSelectedItem());

        // TODO: check code for name and gender field
        if (!checkNameLength(newName)) {
            if (newName != null && newName.length() == 0) {
                nameEdit.setError("New name can not be none");
                return;
            }
            nameEdit.setError("Please enter less than 12 characters.");
            return;
        }

        AppDatabase.getInstance(getContext()).databaseWriteExecutor.execute(() -> {

            ParticipantProfile participantProfile =
                    AppDatabase.getInstance(getContext()).participantProfileDao().getParticipantByEmailNow(FirebaseAuth.getInstance().getCurrentUser().getEmail());
            Log.e(TAG, "wait");
            participantProfile.name = nameEdit.getText().toString();
            if (newGender != Conf.GENDER_ERROR_INT) {
                participantProfile.gender = newGender;
            } else {
                participantProfile.gender = null;
            }

            PostProfileRequestModel postProfileRequestModel = new PostProfileRequestModel(newGender, newName);
            HttpUtil.post(URLs.GetProfileUrl(), postProfileRequestModel, ParticipantProfile.class, response -> {
                        AppDatabase.getInstance(getContext()).databaseWriteExecutor.execute(() -> {
                            Log.e(TAG, TAG + participantProfile.toString());
                            AppDatabase.getInstance(getContext()).participantProfileDao().upsert(response);
                        });
                    },
                    ProfileFragment.this.getContext());
        });

        nameEdit.setVisibility(View.INVISIBLE);
        nameEdit.setError(null);

        String nameInEdit = nameEdit.getText().toString();
        if (nameInEdit == null || nameInEdit.isEmpty()) {
            nameEdit.setText(name);
        } else {
            nameEdit.setText(newName);
        }

        genderSpinner.setVisibility(View.INVISIBLE);
        if (newGender == Conf.GENDER_ERROR_INT) {
            genderSpinner.setSelection(gender);
        } else {
            genderSpinner.setSelection(newGender);
        }

        emailText.setVisibility(View.VISIBLE);
        emailText.setText(email);
        nameText.setVisibility(View.VISIBLE);
        nameText.setText(newName);
        genderText.setVisibility(View.VISIBLE);
        genderText.setText(Conf.GetGenderStrByIndex(newGender));
        mobileSystemText.setVisibility(View.VISIBLE);
        mobileSystemText.setText(mobileSystem);
        androidAPIText.setVisibility(View.VISIBLE);
        androidAPIText.setText(androidAPI);
        deviceModelText.setVisibility(View.VISIBLE);
        deviceModelText.setText(deviceModel);
        editBtn.setText("Edit");
        cancelBtn.setVisibility(View.INVISIBLE);
        resetBtn.setVisibility(View.INVISIBLE);

    }

    private void editBtnOnClick() {
        nameEdit.setVisibility(View.VISIBLE);
        genderSpinner.setVisibility(View.VISIBLE);

        emailText.setVisibility(View.VISIBLE);
        nameText.setVisibility(View.INVISIBLE);
        genderText.setVisibility(View.INVISIBLE);
        mobileSystemText.setVisibility(View.VISIBLE);
        androidAPIText.setVisibility(View.VISIBLE);
        deviceModelText.setVisibility(View.VISIBLE);
        editBtn.setText("Save");
        cancelBtn.setVisibility(View.VISIBLE);
        resetBtn.setVisibility(View.VISIBLE);

        nameEdit.setOnClickListener(v -> nameText.setVisibility(View.INVISIBLE));

    }

    private void resetBtnOnClick() {
        nameEdit.setVisibility(View.VISIBLE);
        genderSpinner.setVisibility(View.VISIBLE);
        nameEdit.setText(name);
        nameEdit.setError(null);
        genderSpinner.setSelection(gender);
    }

    @Override
    public void render(CachedModels cachedModels) {
        ParticipantProfile participantProfile = cachedModels.profile;
        if (participantProfile != null) {
            Log.e(TAG, "Onchange not null");
            emailText.setText(participantProfile.email);
            email = participantProfile.email;

            nameText.setText(participantProfile.name);
            name = participantProfile.name;

            if (participantProfile.gender == null) {
            } else {
                genderText.setText(Conf.GetGenderStrByIndex(participantProfile.gender));
                gender = participantProfile.gender;
            }

            mobileSystemText.setText(participantProfile.mobileSystem);
            mobileSystem = participantProfile.mobileSystem;

            androidAPIText.setText(participantProfile.androidAPI + "");
            androidAPI = participantProfile.androidAPI + "";

            deviceModelText.setText(participantProfile.deviceModel);
            deviceModel = participantProfile.deviceModel;

            genderSpinner.setSelection(gender);
            nameEdit.setText(name);

            if (participantProfile.balance == null) {
                usersBalanceText.setText("0");
            } else {
                usersBalanceText.setText(participantProfile.balance.toString());
            }
            if (participantProfile.totalRecordsNumber == null) {
                usersAmountDataText.setText("0");
            } else {
                usersAmountDataText.setText(participantProfile.totalRecordsNumber.toString());
            }
            if (participantProfile.lifeTimeWallet == null) {
                usersLifeTimeWallet.setText("0");
            } else {
                usersLifeTimeWallet.setText(participantProfile.lifeTimeWallet.toString());
            }
            showTheTier(participantProfile);
        }
    }
}