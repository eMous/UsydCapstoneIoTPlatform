package capstone.cs26.iotPlatform.util;

import android.content.Context;
import android.widget.Toast;

import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.LiveData;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;

import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;

public class CachedModels {
    private final FirebaseUser firebaseUser;

//    private IRender currentFragment;
    private HashSet<IRender> currentFragments = new HashSet<>();

    private final LiveData<ParticipantProfile> profileLiveData;
    private final LiveData<ParticipantNotifications> parNotLiveData;
    private final HashMap<String, LiveData<Project>> projectLiveDataMap = new HashMap<>();

    public ParticipantProfile profile;
    public ParticipantNotifications parNot;
    public final HashMap<String, Project> projects = new HashMap<>();

    private final Context context;
    private final LifecycleOwner lifecycleOwner;
    private final IRender outsideActivity;

    public CachedModels(Context context, LifecycleOwner lifecycleOwner, IRender outsideActivity) {
        this.context = context;
        this.lifecycleOwner = lifecycleOwner;
        this.outsideActivity = outsideActivity;

        AppDatabase appDatabase = AppDatabase.getInstance(context);
        firebaseUser = FirebaseAuth.getInstance().getCurrentUser();
        final String email = firebaseUser.getEmail();

        profileLiveData = appDatabase.participantProfileDao().getParticipantByEmail(email);
        profileLiveData.observe(lifecycleOwner, this::onProfileChanged);

        parNotLiveData = appDatabase.participantNotificationsDao().getParticipantNotificationsByEmail(email);
        parNotLiveData.observe(lifecycleOwner, this::onParNotChanged);
    }

    public void onProfileChanged(ParticipantProfile profile) {
        if (profile == null) return;
        this.profile = profile;
        for (ParticipantProfile.ProjectInParticipantProfile proInPar : profile.projects) {
            String prjId = proInPar.projectId;
            tryObservePrj(prjId);
        }
        tellChanged();
    }


    public void onParNotChanged(ParticipantNotifications parNot) {
        if (parNot == null) return;
        this.parNot = parNot;

        for (String prjId : parNot.prjDetails.keySet()) {
            tryObservePrj(prjId);
        }
        tellChanged();
    }

    public void onProjectChanged(Project project) {
        if (project == null) return;
        projects.put(project._id, project);
        tellChanged();
    }

    private void tryObservePrj(String prjId) {
        if (!projectLiveDataMap.containsKey(prjId)) {
            if (context != null && lifecycleOwner != null) {
                LiveData<Project> projectLiveData =
                        AppDatabase.getInstance(context).projectDao().getProjectByProjectId(prjId);
                projectLiveDataMap.put(prjId, projectLiveData);
                projectLiveData.observe(lifecycleOwner, this::onProjectChanged);
            }
        }
    }

    private void tellChanged() {
        outsideActivity.render(this);
        for (IRender currentFragment:currentFragments){
            if (currentFragment != null) {
                currentFragment.render(this);
            }else{
                Toast.makeText(context,"currentFragment doesnt exist!",Toast.LENGTH_LONG).show();
            }
        }
    }

    public void registerCurrentFragment(IRender iRender) {
//        currentFragment = iRender;
        currentFragments.add(iRender);
        tellChanged();
    }

    public void removeCurrentFragment(IRender iRender) {
        currentFragments.remove(iRender);
//        currentFragment = null;
    }

    public ArrayList<Project> getInProgressProjects() {
        ArrayList<Project> ret = new ArrayList<>();
        if (profile != null) {
            for (ParticipantProfile.ProjectInParticipantProfile proInPar : profile.projects) {
                if (proInPar.joinTime != null && proInPar.leaveTime == null && !proInPar.prjComplete) {
                    Project project = projects.get(proInPar.projectId);
                    if (project != null) {
                        ret.add(project);
                    }
                }
            }
        }
        return ret;
    }
}
