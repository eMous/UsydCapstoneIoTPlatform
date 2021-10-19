package capstone.cs26.iotPlatform.activity.fragment.projectDetail;

import android.content.DialogInterface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.cardview.widget.CardView;
import androidx.core.widget.NestedScrollView;
import androidx.fragment.app.Fragment;
import androidx.navigation.NavController;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.AnswerInvitationRequestModel;
import capstone.cs26.iotPlatform.model.LeaveProjectRequestModel;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.ProjectWallet;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class ProjectDetailsFragment extends Fragment implements View.OnClickListener, IRender {

    public TextView tvYourTaskInfo;
    public TextView tvDescriptionInfo;
    public TextView tvRequirementsInfo;
    public TextView tvMyContributionInfo;
    public NestedScrollView scrollView;
    String prjId;
    Boolean isIn;
    TextView tvYourTaskTitle;
    TextView tvPrjDesTitle;
    TextView tvPrjReqTitle;
    TextView tvPrjProgressTitle;
    TextView tvPrjTitle;
    TextView tvPrjStartTime;
    TextView tvPrjFunding;
    TextView tvPrjRedemptionMode;
    Button btnAcceptProject;
    Button btnRejectProject;
    Button btnLeaveProject;
    View root;
    Project project;
    ParticipantProfile participantProfile;
    ProjectWallet wallet;
    ParticipantProfile.ProjectInParticipantProfile proInPar;
    private CardView titleCard;
    private CardView goalCard;
    private CardView descriptionCard;
    private CardView requirementsCard;
    private CardView progressCard;
    private CardView projectWalletCard;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        prjId = getArguments().getString("prjId");
        isIn = getArguments().getBoolean("isIn");
        root = inflater.inflate(R.layout.fragment_project_details, container, false);
        initUI();
        return root;
    }

    void showLeftUI() {
        btnAcceptProject.setVisibility(View.INVISIBLE);
        btnRejectProject.setVisibility(View.INVISIBLE);
        btnLeaveProject.setVisibility(View.INVISIBLE);
        progressCard.setVisibility(View.INVISIBLE);
    }

    void showInPrjUI() {
        btnAcceptProject.setVisibility(View.INVISIBLE);
        btnRejectProject.setVisibility(View.INVISIBLE);
        btnLeaveProject.setVisibility(View.VISIBLE);
        progressCard.setVisibility(View.VISIBLE);
        projectWalletCard.setVisibility(View.VISIBLE);

        btnLeaveProject.setOnClickListener(
                view -> {
                    AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
                    builder.setTitle("Leave Project");
                    builder.setMessage("Are you sure you want to leave the project?");
                    builder.setPositiveButton("YES", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            LeaveProjectRequestModel leaveProjectRequestModel = new LeaveProjectRequestModel(prjId);
                            leaveProjectRequestModel.request(getContext(), () -> {
                                (new Handler(Looper.getMainLooper())).postDelayed(() -> {
                                    MainActivity activity = (MainActivity) getActivity();
                                    if (activity != null) {
                                        activity.navController.popBackStack();
                                    }
                                }, 450);
                            });
                        }
                    });
                    builder.setNegativeButton("CANCEL", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.cancel();
                        }
                    });
                    builder.show();
                }
        );
    }

    void showInvitingUI() {
        btnAcceptProject.setVisibility(View.VISIBLE);
        btnRejectProject.setVisibility(View.VISIBLE);
        btnLeaveProject.setVisibility(View.INVISIBLE);
        progressCard.setVisibility(View.INVISIBLE);
        projectWalletCard.setVisibility(View.INVISIBLE);

        btnAcceptProject.setOnClickListener(
                view -> {
                    AnswerInvitationRequestModel answerInvitationRequestModel =
                            new AnswerInvitationRequestModel(prjId, true);
                    answerInvitationRequestModel.answer(getContext(), () -> {
                                new Handler(Looper.getMainLooper()).postDelayed(
                                        () -> {
                                            MainActivity activity = (MainActivity) getActivity();
                                            if (activity == null) return;
                                            NavController navController = activity.navController;
                                            navController.getPreviousBackStackEntry().getSavedStateHandle().set(
                                                    "backFromDetailFragment",
                                                    true);
                                            navController.popBackStack();
                                        }, 200
                                );

                            }
                    );
                }
        );
        btnRejectProject.setOnClickListener(
                view -> {
                    AnswerInvitationRequestModel answerInvitationRequestModel =
                            new AnswerInvitationRequestModel(prjId, false);
                    answerInvitationRequestModel.answer(getContext(), () -> {
                        new Handler(Looper.getMainLooper()).postDelayed(
                                () -> {
                                    MainActivity activity = (MainActivity) getActivity();
                                    if (activity == null) return;
                                    NavController navController = activity.navController;
                                    navController.getPreviousBackStackEntry().getSavedStateHandle().set(
                                            "backFromDetailFragment",
                                            true);
                                    navController.popBackStack();
                                }, 200
                        );

                    });
                }
        );
    }

    void checkProgressBar() {
        MainActivity mainActivity = ((MainActivity) getActivity());
        if (mainActivity != null) {
            if (participantProfile == null || project == null) {
                mainActivity.waitProgress();
            } else {
                mainActivity.doneProgress();
            }
        }
    }

    void initUI() {
        titleCard = root.findViewById(R.id.projectTitleCard);
        goalCard = root.findViewById(R.id.yourTaskCard);
        descriptionCard = root.findViewById(R.id.projectDescriptionCard);
        requirementsCard = root.findViewById(R.id.projectRequirementsCard);
        progressCard = root.findViewById(R.id.projectProgressCard);
        projectWalletCard = root.findViewById(R.id.projectWalletCard);

        btnAcceptProject = root.findViewById(R.id.btnAccept);
        btnRejectProject = root.findViewById(R.id.btnReject);
        btnLeaveProject = root.findViewById(R.id.btnLeave);

        // adding click listener to cards
        goalCard.setOnClickListener(this);
        descriptionCard.setOnClickListener(this);
        requirementsCard.setOnClickListener(this);
        progressCard.setOnClickListener(this);
        projectWalletCard.setOnClickListener(this);

        tvYourTaskTitle = root.findViewById(R.id.textYourTask);
        tvPrjDesTitle = root.findViewById(R.id.textProjectDescription);
        tvPrjProgressTitle = root.findViewById(R.id.textPrjProgress);
        tvPrjReqTitle = root.findViewById(R.id.textRequirements);
        tvPrjTitle = root.findViewById(R.id.tv_prj_title);
        tvPrjStartTime = root.findViewById(R.id.tv_prj_owner_name);
        tvPrjFunding = root.findViewById(R.id.tv_prj_funding);
        tvPrjRedemptionMode = root.findViewById(R.id.tv_redemption_mode);

        scrollView = root.findViewById(R.id.scrollView);
        tvYourTaskInfo = root.findViewById(R.id.yourTaskInfo);
        tvDescriptionInfo = root.findViewById(R.id.descriptionInfo);
        tvRequirementsInfo = root.findViewById(R.id.requirementInfo);
        tvMyContributionInfo = root.findViewById(R.id.myContributionInfo);

        if (!isIn) {
            // Inviting
            showInvitingUI();
        } else {
            // Is my project
            showInPrjUI();
        }

        render(((MainActivity) getActivity()).cachedModels);
    }

    @Override
    public void onClick(View v) {
        Bundle bundle = new Bundle();
        bundle.putBoolean("isIn", isIn);
        switch (v.getId()) {
            case R.id.yourTaskCard:
                bundle.putInt("select", R.id.yourTaskCard);
                bundle.putString("prjId", prjId);
                ((MainActivity) getActivity()).navController.navigate(R.id.projectDetailsFragmentAllCardsInfo,
                        bundle);
                break;

            case R.id.projectDescriptionCard:
                bundle.putInt("select", R.id.projectDescriptionCard);
                bundle.putString("prjId", prjId);
                ((MainActivity) getActivity()).navController.navigate(R.id.projectDetailsFragmentAllCardsInfo,
                        bundle);
                break;

            case R.id.projectRequirementsCard:
                bundle.putInt("select", R.id.projectRequirementsCard);
                bundle.putString("prjId", prjId);
                ((MainActivity) getActivity()).navController.navigate(R.id.projectDetailsFragmentAllCardsInfo,
                        bundle);
                break;

            case R.id.projectProgressCard:
                bundle.putString("prjId", prjId);
                ((MainActivity) getActivity()).navController.navigate(R.id.projectProgressDetailsFragment,
                        bundle);
                break;

            case R.id.projectWalletCard:
                bundle.putString("prjId", prjId);
                ((MainActivity) getActivity()).navController.navigate(R.id.projectDetailWalletFragment,
                        bundle);
                break;
        }
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

        ((MainActivity) getActivity()).setFragmentTitle("Project Detail");
        ((MainActivity) getActivity()).enableSwipeRefresh(true);
    }

    @Override
    public void render(CachedModels cachedModels) {
        participantProfile = cachedModels.profile;
        project = cachedModels.projects.get(prjId);
        checkProgressBar();
        if (participantProfile != null) {
            proInPar = participantProfile.findProInPar(prjId);
            if (proInPar != null) {
                if (proInPar.joinTime == null) {
                    showInvitingUI();
                } else if (proInPar.leaveTime == null) {
                    showInPrjUI();
                } else {
                    showLeftUI();
                }
            } else {
                showInvitingUI();
            }
            wallet = participantProfile.findProjectWallet(prjId);
            if (wallet != null) {
                tvPrjFunding.setText(wallet.getExpectedFunding());
                tvPrjRedemptionMode.setText(proInPar.getRedemptionMode());
            }
        }
        if (project != null) {
            tvPrjTitle.setText(project.prjTitle);
            tvPrjStartTime.setText(project.prjStartTime.toString());
        }
    }
}
