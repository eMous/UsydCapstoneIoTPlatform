package capstone.cs26.iotPlatform.activity.fragment.dashboard;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.ProjectWallet;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class DashboardFragment extends Fragment implements IRender {
    static String TAG = "DashboardFragment";
    View root;
    TextView tvName;
    TextView tvTotalProjects;
    TextView tvCurrentProjects;
    TextView tvProjectInvites;
    TextView tvBalance;
    TextView tvTotalPoints;
    TextView tvRedeemedPoints;
    TextView tvPointsLeftToRedeem;
    TextView tvSwipeProjectsCardText;
    RecyclerView recyclerView;
    DashboardRecyclerViewAdapter recyclerViewAdapter;
    ParticipantProfile profile;
    ParticipantNotifications parNotifications;
    ArrayList<Project> prjObjects = new ArrayList<>();

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        root = inflater.inflate(R.layout.fragment_dashboard, container, false);
        initUI();
        return root;
    }

    private void initUI() {
        tvName = root.findViewById(R.id.textName);
        tvTotalProjects = root.findViewById(R.id.totalProjectsInfo);
        tvCurrentProjects = root.findViewById(R.id.currentProjectsInfo);
        tvProjectInvites = root.findViewById(R.id.projectInvitesInfo);
        tvBalance = root.findViewById(R.id.balanceInfo);
        tvTotalPoints = root.findViewById(R.id.totalPointsInfo);
        tvRedeemedPoints = root.findViewById(R.id.redeemedPointsInfo);
        tvPointsLeftToRedeem = root.findViewById(R.id.pointsLeftToRedeemInfo);

        recyclerView = root.findViewById(R.id.projectsRecyclerView);
        recyclerViewAdapter = new DashboardRecyclerViewAdapter(prjObjects, this, recyclerView);
        tvSwipeProjectsCardText = root.findViewById(R.id.swipeProjectsCardText);
        recyclerView.setAdapter(recyclerViewAdapter);
        LinearLayoutManager layoutManager
                = new LinearLayoutManager(requireContext(), LinearLayoutManager.HORIZONTAL, false);
        recyclerView.setLayoutManager(layoutManager);

        render(((MainActivity) getActivity()).cachedModels);
    }

    private Float getTotalLeftRedeemablePoints(ParticipantProfile profile) {
        Float ret = 0f;
        if (profile == null || profile.projectWallets == null || profile.projectWallets.size() == 0) {
            return ret;
        }
        for (ProjectWallet project : profile.projectWallets) {
            if (!project.exchangeable) continue;
            ret += project.existingPoints;
        }
        return ret;
    }

    private Float getTotalRedeemedPoints(ParticipantProfile profile) {
        Float ret = 0f;
        if (profile == null || profile.projectWallets == null || profile.projectWallets.size() == 0) {
            return ret;
        }
        for (ProjectWallet project : profile.projectWallets) {
            if (!project.exchangeable) continue;
            ret += project.exchangedMoney * project.conversionRate;
        }
        return ret;
    }

    private void checkRecyclerViewShow() {
        int size = prjObjects.size();
        if (size == 0) {
            tvSwipeProjectsCardText.setVisibility(View.GONE);
            recyclerView.setVisibility(View.GONE);
        } else {
            tvSwipeProjectsCardText.setVisibility(View.VISIBLE);
            recyclerView.setVisibility(View.VISIBLE);
        }
    }

    private Integer getPendingInvitationNumber() {
        Integer ret = 0;
        if (parNotifications == null || parNotifications.unhandledInvitations == null || parNotifications.unhandledInvitations.size() == 0) {
            return ret;
        }
        ret = parNotifications.unhandledInvitations.size();
        return ret;
    }

    private Integer getTotalProjectCount(ArrayList<ParticipantProfile.ProjectInParticipantProfile> projects) {
        Integer ret = 0;

        if (projects == null || projects.size() == 0) {
            return ret;
        }
        for (ParticipantProfile.ProjectInParticipantProfile project : projects) {
            if (project.leaveTime != null) continue;
            if (project.joinTime == null) continue;
            ret++;
        }
        return ret;
    }

    private Integer getCurrentProjectCount(ArrayList<ParticipantProfile.ProjectInParticipantProfile> projects) {
        Integer ret = 0;

        if (projects == null || projects.size() == 0) {
            return ret;
        }
        for (ParticipantProfile.ProjectInParticipantProfile prjInPar : projects) {
            if (prjInPar.leaveTime != null) continue;
            if (prjInPar.joinTime == null) continue;
            if (prjInPar.prjComplete) continue;
            ret++;
        }
        return ret;
    }

    @Override
    public void onResume() {
        super.onResume();
        CachedModels cachedModels = ((MainActivity) getActivity()).cachedModels;
        cachedModels.registerCurrentFragment(this);

        ((MainActivity) getActivity()).setFragmentTitle("Dashboard");
        ((MainActivity) getActivity()).enableSwipeRefresh(false);
    }

    @Override
    public void onPause() {
        super.onPause();
        ((MainActivity) getActivity()).cachedModels.removeCurrentFragment(this);
    }

    @Override
    public void render(CachedModels cachedModels) {
        parNotifications = cachedModels.parNot;
        profile = cachedModels.profile;
        if (profile != null) {
            recyclerViewAdapter.participantProfile = profile;
        }
        prjObjects = cachedModels.getInProgressProjects();
        recyclerViewAdapter.projects = prjObjects;
        checkRecyclerViewShow();

        if (profile == null) return;
        tvName.setText("Hi " + profile.name);
        tvTotalProjects.setText("" + getTotalProjectCount(profile.projects));
        tvCurrentProjects.setText("" + getCurrentProjectCount(profile.projects));
        tvProjectInvites.setText("" + getPendingInvitationNumber());
        tvBalance.setText("" + profile.balance);
        tvTotalPoints.setText("" + profile.lifeTimeWallet);
        tvRedeemedPoints.setText("" + getTotalRedeemedPoints(profile));
        tvPointsLeftToRedeem.setText("" + getTotalLeftRedeemablePoints(profile));

        recyclerViewAdapter.notifyDataSetChanged();
    }
}
