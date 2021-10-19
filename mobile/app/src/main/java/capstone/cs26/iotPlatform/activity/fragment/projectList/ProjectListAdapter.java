package capstone.cs26.iotPlatform.activity.fragment.projectList;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class ProjectListAdapter extends RecyclerView.Adapter<ProjectListAdapter.ProjectListViewHolder> implements IRender {

    Context mContext;
    ProjectListFragment fragment;
    ParticipantProfile profile;
    ArrayList<Project> projects;
    ArrayList<Project> inProjects;

    public ProjectListAdapter(Context context, ProjectListFragment fragment) {
        mContext = context;
        this.fragment = fragment;

        CachedModels cachedModels = ((MainActivity) fragment.getActivity()).cachedModels;
        render(cachedModels);
        cachedModels.registerCurrentFragment(this);
    }

    public void onResume() {
        CachedModels cachedModels = ((MainActivity) fragment.getActivity()).cachedModels;
        cachedModels.registerCurrentFragment(this);
    }

    public void onPause() {
        ((MainActivity) fragment.getActivity()).cachedModels.removeCurrentFragment(this);
    }

    @Override
    public void render(CachedModels cachedModels) {
        profile = cachedModels.profile;
        projects = new ArrayList<>();
        if (profile != null) {
            for (ParticipantProfile.ProjectInParticipantProfile proInPar : profile.projects) {
                Project project = cachedModels.projects.get(proInPar.projectId);
                if (project != null) {
                    projects.add(project);
                }
            }
            if (profile.inAnyProject()) {
                fragment.recyclerView.setVisibility(View.VISIBLE);
                fragment.noProjectToDisplay.setVisibility(View.GONE);
            } else {
                fragment.recyclerView.setVisibility(View.GONE);
                fragment.noProjectToDisplay.setVisibility(View.VISIBLE);
            }
            notifyDataSetChanged();
        }
    }

    private void showInProgressOrNot(Boolean prjComplete, TextView v) {
        if (prjComplete == null || !prjComplete) {
            v.setText("In Progress");
            v.setBackgroundColor(ContextCompat.getColor(mContext, R.color.yellow));
        } else {
            v.setText("Complete");
            v.setBackgroundColor(Color.parseColor("#32CD32"));
        }
    }

    @NonNull
    @Override
    public ProjectListViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.fragment_project_list_item, parent, false);
        ProjectListViewHolder listViewHolder = new ProjectListViewHolder(view);
        return listViewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull ProjectListViewHolder holder, int position) {
        // We get the project from the ArrayList<Project> in this adapter
        // (which should have been set by some other file)
        // based on the index indicated by the parameter 'position'

        Project currProjInRow = inProjects.get(position);
        holder.bindProjectInfo(currProjInRow, profile);
    }

    @Override
    public int getItemCount() {
        if (projects == null || profile == null || profile.projects == null) {
            return 0;
        }
        int ret = 0;
        inProjects = new ArrayList<>();
        for (int i = 0; i < profile.projects.size(); ++i) {
            if (profile.projects.get(i).leaveTime == null && profile.projects.get(i).joinTime != null) {
                for (Project p : projects
                ) {
                    if (p._id.equals(profile.projects.get(i).projectId)) {
                        inProjects.add(p);
                        ret++;
                        break;
                    }
                }
            }
        }
        return ret;
    }

    public class ProjectListViewHolder extends RecyclerView.ViewHolder {

        public ImageView projectImage;
        public TextView projectTitle;
        public TextView projectDescription;
        public TextView projectCompleteStatus;

        public ProjectListViewHolder(@NonNull View itemView) {
            super(itemView);
            mContext = itemView.getContext();
            projectTitle = itemView.findViewById(R.id.projectTitle);
            projectDescription = itemView.findViewById(R.id.projectDescription);
            projectCompleteStatus = itemView.findViewById(R.id.projectStatus);
        }

        public void bindProjectInfo(Project proj, ParticipantProfile profile) {
            if (proj != null) {
                // NOTE: We intentionally ignore the project image for now, since we are not
                // supporting images at the moment
                projectTitle.setText(proj.prjTitle);
                projectDescription.setText(proj.prjDescription);
                ArrayList<ParticipantProfile.ProjectInParticipantProfile> prjsInPar = profile.projects;
                ParticipantProfile.ProjectInParticipantProfile prjInPar = null;
                for (int i = 0; i < prjsInPar.size(); ++i) {
                    ParticipantProfile.ProjectInParticipantProfile xPrjInPar = prjsInPar.get(i);
                    if (xPrjInPar.projectId.equals(proj._id)) {
                        prjInPar = xPrjInPar;
                        break;
                    }
                }
                if (prjInPar != null) {
                    showInProgressOrNot(prjInPar.prjComplete, projectCompleteStatus);
                } else {
                    showInProgressOrNot(false, projectCompleteStatus);
                }
                this.itemView.setOnClickListener(view -> {
                    Bundle bundle = new Bundle();
                    bundle.putString("prjId", proj._id);
                    bundle.putBoolean("isIn", true);
                    ((MainActivity) fragment.getActivity()).navController.navigate(R.id.projectDetailsFragment,
                            bundle);
                });
            }
        }
    }
}