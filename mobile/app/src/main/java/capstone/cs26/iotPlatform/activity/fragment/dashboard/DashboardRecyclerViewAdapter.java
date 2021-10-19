package capstone.cs26.iotPlatform.activity.fragment.dashboard;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;
import capstone.cs26.iotPlatform.model.ProjectWallet;

public class DashboardRecyclerViewAdapter extends RecyclerView.Adapter<DashboardRecyclerViewAdapter.ProjectViewHolder> {

    ArrayList<Project> projects;
    ParticipantProfile participantProfile;
    DashboardFragment fragment;
    RecyclerView recyclerView;

    DashboardRecyclerViewAdapter(ArrayList<Project> projects, DashboardFragment fragment, RecyclerView recyclerView) {
        this.projects = projects;
        this.fragment = fragment;
        this.recyclerView = recyclerView;
    }

    @NonNull
    @Override
    public ProjectViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.fragment_dashboard_project_item, parent, false);
        ProjectViewHolder listViewHolder = new ProjectViewHolder(view);
        return listViewHolder;
    }

    @Override
    public void onBindViewHolder(@NonNull ProjectViewHolder holder, int position) {
        Project currentItem = projects.get(position);
        holder.tvPrjId.setText(currentItem.prjTitle);
        holder.tvPrjTitle.setText(currentItem.prjTitle);
        holder.tvSensorUsed.setText(currentItem.getSensorRequiredStr(fragment.getContext()));
        holder.tvLifeTimePointsEarned.setText("");
        if (participantProfile != null) {
            if (participantProfile.projects != null) {
                for (int i = 0; i < participantProfile.projectWallets.size(); ++i) {
                    if (participantProfile.projectWallets.get(i).projectId.equals(currentItem._id)) {
                        ProjectWallet wallet = participantProfile.projectWallets.get(i);
                        float lifeTimeTotal = wallet.exchangedMoney * wallet.conversionRate + wallet.existingPoints;
                        holder.tvLifeTimePointsEarned.setText(lifeTimeTotal + "");
                        if (wallet.exchangeable) {
                            holder.tvRedeemableEarned.setText(lifeTimeTotal + "");
                        } else {
                            holder.tvRedeemableEarned.setText("0");
                        }
                        break;
                    }
                }
            }
        }
        holder.itemView.setOnClickListener(v -> {
            NavController navController = NavHostFragment.findNavController(fragment);
            Intent intent = new Intent();
            Bundle bundle = new Bundle();
            bundle.putString("prjId", currentItem._id);
            bundle.putBoolean("isIn", true);
            navController.navigate(R.id.projectDetailsFragment, bundle);
        });
    }

    @Override
    public int getItemCount() {
        return projects.size();
    }

    class ProjectViewHolder extends RecyclerView.ViewHolder {
        TextView tvPrjId;
        TextView tvPrjTitle;
        TextView tvSensorUsed;
        TextView tvLifeTimePointsEarned;
        TextView tvRedeemableEarned;

        public ProjectViewHolder(@NonNull View itemView) {
            super(itemView);
            tvPrjId = itemView.findViewById(R.id.projectDetail_ID);
            tvPrjTitle = itemView.findViewById(R.id.projectDetail_projectTitle);
            tvSensorUsed = itemView.findViewById(R.id.projectDetail_projectSensors);
            tvLifeTimePointsEarned = itemView.findViewById(R.id.projectDetail_projectLifeTimePoints);
            tvRedeemableEarned = itemView.findViewById(R.id.projectDetail_projectRedeemablePoints);
        }
    }
}
