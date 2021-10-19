package capstone.cs26.iotPlatform.activity.fragment.projectDetail;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import java.text.NumberFormat;
import java.util.ArrayList;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

import static capstone.cs26.iotPlatform.activity.fragment.projectDetail.ProjectProgressDetailsFragment.getTaskTotal;

public class projectDetailsFragmentAllCardsInfo extends Fragment implements IRender {

    TextView yourTaskInfo, descriptionInfo, requirementInfo, myContributionInfo, tvPoints;
    Boolean isIn;
    String prjId;
    Integer viewId;
    LinearLayout yourTaskLine;
    LinearLayout projectDescriptionLine;
    LinearLayout projectRequirementsLine;
    LinearLayout myContributionLine;
    LinearLayout projectCompletionLine;

    String prjDescription = "";
    String yourTaskText = "";
    String prjRequirementsText = "";
    Integer taskGoalTotal = null;
    Integer completeNum = null;
    Integer incompleteNum = null;

    View root;
    Project project;
    ParticipantProfile participantProfile;
    ParticipantProfile.ProjectInParticipantProfile proInPar;
//    LiveData<Project> projectLiveData;
//    Observer<Project> projectObserver;

//    LiveData<ParticipantProfile> parLiveData;
//    Observer<ParticipantProfile> parObserver;

//    public projectDetailsFragmentAllCardsInfo() {
//        // Required empty public constructor
//    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        prjId = getArguments().getString("prjId");
        viewId = getArguments().getInt("select");
        isIn = getArguments().getBoolean("isIn");
        root = inflater.inflate(R.layout.fragment_project_details_all_cards_info, container, false);
        initUI();
//        projectLiveData = AppDatabase.getInstance(getContext()).projectDao().getProjectByProjectId(prjId);
//        projectObserver = this::onProjectChanged;
//        projectLiveData.observe(getViewLifecycleOwner(), projectObserver);

//        String parEmail = FirebaseAuth.getInstance().getCurrentUser().getEmail();
//        parLiveData = AppDatabase.getInstance(getContext()).participantProfileDao().getParticipantByEmail(parEmail);
//        parObserver = this::onParticipantChanged;
//        parLiveData.observe(getViewLifecycleOwner(), parObserver);

        getData(viewId);
        return root;
    }

    void initUI() {
        yourTaskInfo = root.findViewById(R.id.yourTaskInfo);
        descriptionInfo = root.findViewById(R.id.descriptionInfo);
        requirementInfo = root.findViewById(R.id.requirementInfo);
        myContributionInfo = root.findViewById(R.id.myContributionInfo);
        tvPoints = root.findViewById(R.id.tvPoints);
        yourTaskLine = root.findViewById(R.id.yourTaskLine);
        projectDescriptionLine = root.findViewById(R.id.projectDescriptionLine);
        projectRequirementsLine = root.findViewById(R.id.projectRequirementsLine);
        myContributionLine = root.findViewById(R.id.myContributionLine);
        projectCompletionLine = root.findViewById(R.id.line1);

        if (!isIn) {
            projectCompletionLine.setVisibility(View.GONE);
        } else {
            projectCompletionLine.setVisibility(View.VISIBLE);
        }
        render(((MainActivity) getActivity()).cachedModels);
    }

//    void onParticipantChanged(ParticipantProfile par) {
//        if (par != null) {
//            participantProfile = par;
//            ParticipantProfile.ProjectInParticipantProfile xProInPar = par.findProInPar(prjId);
//            if (xProInPar != null) {
//                proInPar = xProInPar;
//            }
//            render();
//        }
//    }

//    private void onProjectChanged(Project project) {
//        if (project != null) {
//            this.project = project;
//            render();
//        }
//    }

    public void getData(Integer viewId) {

        switch (viewId) {
            case R.id.yourTaskCard:
                yourTaskLine.setBackgroundResource(R.drawable.white_rectangle_drawable);
                break;
            case R.id.projectDescriptionCard:
                projectDescriptionLine.setBackgroundResource(R.drawable.white_rectangle_drawable);
                break;
            case R.id.projectRequirementsCard:
                projectRequirementsLine.setBackgroundResource(R.drawable.white_rectangle_drawable);
                break;
        }
    }

    private String getYourTaskText(ParticipantProfile profile, String prjId) {
        StringBuilder builder = new StringBuilder();
        builder.append("");
        if (profile != null) {
            ParticipantProfile.ProjectInParticipantProfile xProInPar = profile.findProInPar(prjId);
            if (xProInPar != null) {
                for (int i = 0; i < xProInPar.sensorRecords.size(); ++i) {
                    builder.append("Sensor ID: ").append(xProInPar.sensorRecords.get(i).sensorId).append('\n')
                            .append("Goal Num: ").append(xProInPar.sensorRecords.get(i).required.toString()).append('\n')
                            .append("Collected Num: ").append(xProInPar.sensorRecords.get(i).number.toString());
                    if (i != xProInPar.sensorRecords.size() - 1) {
                        builder.append('\n').append('\n');
                    }
                }
            }
        }
        return builder.toString();
    }

    private String getRequirementsText(ArrayList<Project.ProjectRequirement> requirements) {
        StringBuilder builder = new StringBuilder();
        builder.append("");

        for (int i = 0; i < requirements.size(); ++i) {
            Project.ProjectRequirement requirement = requirements.get(i);
            builder.append(requirement.getText());
            if (i != requirements.size() - 1) {
                builder.append('\n').append('\n');
            }
        }
        return builder.toString();
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

        ((MainActivity) getActivity()).setFragmentTitle("Project Details");
        ((MainActivity) getActivity()).enableSwipeRefresh(false);
    }

    @Override
    public void render(CachedModels cachedModels) {
        participantProfile = cachedModels.profile;
        project = cachedModels.projects.get(prjId);
        if (participantProfile != null) {
            proInPar = participantProfile.findProInPar(prjId);
        }
        if (participantProfile == null || project == null || proInPar == null) return;

        prjDescription = project.prjDescription;
        yourTaskText = getYourTaskText(participantProfile, prjId);
        ArrayList<Project.ProjectRequirement> requirements = project.getRealPrjRequirements();
        prjRequirementsText = getRequirementsText(requirements);

        // calculate percentage completed for a project

        completeNum = 0;
        incompleteNum = taskGoalTotal;
        taskGoalTotal = getTaskTotal(participantProfile, prjId);
        completeNum = 0;
        incompleteNum = taskGoalTotal;

        for (ParticipantProfile.SimpleSensorRecord record : proInPar.sensorRecords) {
            completeNum += record.number;
            incompleteNum -= record.number;
            if (incompleteNum <= 0) {
                incompleteNum = 0;
            }
        }

        Float fGoal = Float.valueOf(taskGoalTotal);
        Float fComplete = Float.valueOf(completeNum);
        Float fInComplete = Float.valueOf(incompleteNum);

        NumberFormat format = NumberFormat.getPercentInstance();
        format.setMaximumFractionDigits(1);

        tvPoints.setText(format.format(fComplete / fGoal));
        yourTaskInfo.setText(yourTaskText);
        descriptionInfo.setText(prjDescription);
        requirementInfo.setText(prjRequirementsText);
    }
}