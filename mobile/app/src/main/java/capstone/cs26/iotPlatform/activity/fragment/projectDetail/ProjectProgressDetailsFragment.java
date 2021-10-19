package capstone.cs26.iotPlatform.activity.fragment.projectDetail;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;

import org.eazegraph.lib.charts.PieChart;
import org.eazegraph.lib.models.PieModel;

import java.text.NumberFormat;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class ProjectProgressDetailsFragment extends Fragment implements IRender {

    TextView tvCompleted, tvIncompleted;
    PieChart pieChart;
    String prjId;
    View root;
//    LiveData<Project> projectLiveData;
//    Observer<Project> projectObserver;
//
//    LiveData<ParticipantProfile> profileLiveData;
//    Observer<ParticipantProfile> profileObserver;

    ParticipantProfile.ProjectInParticipantProfile proInPar;
    ParticipantProfile profile;
    Project project;

    Integer taskGoalTotal = null;
    Integer completeNum = null;
    Integer incompleteNum = null;
    PieModel pieModelComplete = null;
    PieModel pieModelIncomplete = null;

    //    private void onProjectChanged(Project project) {
//        if (project != null){
//            this.project = project;
//            render();
//        }
//    }
//    private void onParticipantChanged(ParticipantProfile profile){
//        if (profile != null){
//            this.profile = profile;
//            ParticipantProfile.ProjectInParticipantProfile xProInPar = profile.findProInPar(prjId);
//            if (xProInPar != null){
//                this.proInPar = xProInPar;
//                render();
//                return;
//            }
//        }
//    }
//    public void render(){
//        if (project != null && proInPar != null){
//            completeNum = 0;
//            incompleteNum = taskGoalTotal;
//            taskGoalTotal = getTaskTotal(profile,prjId);
//
//            completeNum = 0;
//            incompleteNum = taskGoalTotal;
//
//            for (ParticipantProfile.SimpleSensorRecord record: proInPar.sensorRecords){
//                completeNum += record.number;
//                incompleteNum -= record.number;
//                if (incompleteNum <= 0){
//                    incompleteNum = 0;
//                }
//            }
//            Float fGoal = Float.valueOf(taskGoalTotal);
//            Float fComplete = Float.valueOf(completeNum);
//            Float fInComplete = Float.valueOf(incompleteNum);
//
//            NumberFormat format = NumberFormat.getPercentInstance();
//            format.setMaximumFractionDigits(1);
//            tvCompleted.setText(format.format(fComplete/fGoal));
//            tvIncompleted.setText(format.format(fInComplete/fGoal));
//
//            pieModelComplete.setValue(completeNum);
//            pieModelIncomplete.setValue(incompleteNum);
//            pieChart.update();
//            // To animate the pie chart
//            pieChart.startAnimation();
//        }
//    }
    public static Integer getTaskTotal(ParticipantProfile profile, String prjId) {
        if (profile == null) {
            return 0;
        }
        ParticipantProfile.ProjectInParticipantProfile proInPar = profile.findProInPar(prjId);
        if (proInPar == null) {
            return 0;
        }
        int ret = 0;
        for (int i = 0; i < proInPar.sensorRecords.size(); ++i) {
            ret += proInPar.sensorRecords.get(i).required;
        }
        return ret;
    }

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        prjId = getArguments().getString("prjId");
        root = inflater.inflate(R.layout.fragment_project_details_project_progress, container, false);
        initUI();
//        projectLiveData = AppDatabase.getInstance(getContext()).projectDao().getProjectByProjectId(prjId);
//        projectObserver = this::onProjectChanged;
//        projectLiveData.observe(getViewLifecycleOwner(),projectObserver);
//
//        profileLiveData =
//                AppDatabase.getInstance(getContext()).participantProfileDao().getParticipantByEmail(FirebaseAuth.getInstance().getCurrentUser().getEmail());
//        profileObserver = this::onParticipantChanged;
//        profileLiveData.observe(getViewLifecycleOwner(),profileObserver);

        return root;
    }

    void initUI() {
        tvCompleted = root.findViewById(R.id.tvCompleted);
        tvIncompleted = root.findViewById(R.id.tvIncompleted);
        pieChart = root.findViewById(R.id.piechart);
        pieModelComplete = new PieModel(
                "completed",
                0,
                Color.parseColor("#66BB6A"));
        pieChart.addPieSlice(pieModelComplete);
        pieModelIncomplete = new PieModel(
                "Incompleted",
                0,
                Color.parseColor("#FFA726"));
        pieChart.addPieSlice(pieModelIncomplete);
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

        ((MainActivity) getActivity()).setFragmentTitle("Task Progress");
        ((MainActivity) getActivity()).enableSwipeRefresh(false);
    }

    @Override
    public void render(CachedModels cachedModels) {
        project = cachedModels.projects.get(prjId);
        profile = cachedModels.profile;
        if (profile != null) {
            proInPar = profile.findProInPar(prjId);
        }

        if (project != null && proInPar != null) {
            completeNum = 0;
            incompleteNum = taskGoalTotal;
            taskGoalTotal = getTaskTotal(profile, prjId);

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
            tvCompleted.setText(format.format(fComplete / fGoal));
            tvIncompleted.setText(format.format(fInComplete / fGoal));

            pieModelComplete.setValue(completeNum);
            pieModelIncomplete.setValue(incompleteNum);
            pieChart.update();
            // To animate the pie chart
            pieChart.startAnimation();
        }
    }
}
