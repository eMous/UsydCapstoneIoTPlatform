package capstone.cs26.iotPlatform.activity.fragment.projectDetail;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.ProjectWallet;
import capstone.cs26.iotPlatform.model.RedeemRequestModel;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class ProjectDetailWalletFragment extends Fragment implements TextWatcher, View.OnClickListener, IRender {

    TextView tvProjectTitle, tvExistingFunds, tvTotalPointsEarned, tvPointsRemaining, tvRedemptionMode;
    EditText edRedeemPoints;
    Button btnRedeem;

    String prjId;
    View root;

    ParticipantProfile profile;
    ParticipantProfile.ProjectInParticipantProfile proInPar;
    Project project;

    Float redeemValue = 0f;
    Float remainingPoints = null;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        prjId = getArguments().getString("prjId");
        root = inflater.inflate(R.layout.fragment_project_details_project_wallet, container, false);
        initUI();
        return root;
    }

    void initUI() {
        tvProjectTitle = root.findViewById(R.id.projectTitle_info);
        tvExistingFunds = root.findViewById(R.id.existingFunds_info);
        tvTotalPointsEarned = root.findViewById(R.id.totalPointsEarned_info);
        tvPointsRemaining = root.findViewById(R.id.pointsRemaining_info);
        tvRedemptionMode = root.findViewById(R.id.redemptionMode_info);

        edRedeemPoints = root.findViewById(R.id.editTextRedeemPoints);
        edRedeemPoints.addTextChangedListener(this);
        btnRedeem = root.findViewById(R.id.btn_redeem);
        btnRedeem.setOnClickListener(this);

        render(((MainActivity) getActivity()).cachedModels);
    }

    @Override
    public void onPause() {
        super.onPause();
        ((MainActivity) getActivity()).cachedModels.removeCurrentFragment(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        CachedModels cachedModels = ((MainActivity) getActivity()).cachedModels;
        cachedModels.registerCurrentFragment(this);

        ((MainActivity) getActivity()).setFragmentTitle("Project Wallet");
        ((MainActivity) getActivity()).enableSwipeRefresh(false);
    }

    @Override
    public void beforeTextChanged(CharSequence s, int start, int count, int after) {
    }

    @Override
    public void onTextChanged(CharSequence s, int start, int before, int count) {
    }

    @Override
    public void afterTextChanged(Editable s) {
        edRedeemPoints.setError(null);
        String val = s.toString();
        Float fVal = null;
        try {
            fVal = Float.parseFloat(val);
        } catch (Exception e) {

        }
        if (fVal == null) {
            edRedeemPoints.setError("Please input a positive number.");
        } else {
            redeemValue = fVal;
        }


    }

    @Override
    public void onClick(View v) {
        if (redeemValue == null || redeemValue <= 0) {
            edRedeemPoints.setError("Please input a positive number.");
            return;
        }
        if (remainingPoints != null) {
            if (redeemValue > remainingPoints) {
                edRedeemPoints.setError("The number can not be larger than the remaining points.");
                return;
            }
        }
        (new RedeemRequestModel(prjId, redeemValue)).request(getContext());

        btnRedeem.setEnabled(false);
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            btnRedeem.setEnabled(true);
        }, 3000);
    }

    @Override
    public void render(CachedModels cachedModels) {
        profile = cachedModels.profile;
        project = cachedModels.projects.get(prjId);
        if (profile != null) {
            proInPar = profile.findProInPar(prjId);
        }

        if (project != null) {
            tvProjectTitle.setText(project.prjTitle);
        }
        if (profile != null) {
            ProjectWallet wallet = profile.findProjectWallet(prjId);
            if (wallet != null) {
                boolean bButtonEnable = true;
                if (proInPar != null) {
                    if (!proInPar.prjComplete) {
                        if (proInPar.isFullRedeemOnly == null || proInPar.isFullRedeemOnly) {
                            bButtonEnable = false;
                        }
                    }
                }
                btnRedeem.setEnabled(bButtonEnable);

                tvExistingFunds.setText(Float.toString(wallet.maxExchangeable - wallet.exchangedMoney));

                if (wallet.existingPoints != null && wallet.conversionRate != null && wallet.exchangedMoney != null) {
                    float totalPoints =
                            wallet.existingPoints + wallet.conversionRate * wallet.exchangedMoney;
                    tvTotalPointsEarned.setText(Float.toString(totalPoints));
                }
                if (wallet.existingPoints != null) {
                    remainingPoints = wallet.existingPoints;
                    tvPointsRemaining.setText(remainingPoints.toString());
                }
                if (proInPar != null) {
                    tvRedemptionMode.setText(proInPar.getRedemptionMode());
                }
            }
        }
    }
}
