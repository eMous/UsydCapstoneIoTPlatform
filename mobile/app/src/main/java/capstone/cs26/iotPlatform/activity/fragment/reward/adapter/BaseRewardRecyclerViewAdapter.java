package capstone.cs26.iotPlatform.activity.fragment.reward.adapter;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import java.util.HashMap;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.fragment.reward.RewardViewHolder;
import capstone.cs26.iotPlatform.model.BaseParticipantPointStatistics;
import capstone.cs26.iotPlatform.model.ParticipantProfile;

public abstract class BaseRewardRecyclerViewAdapter extends RecyclerView.Adapter<RewardViewHolder> {
    public Integer yearsUsed;
    public Integer earliestYear;
    public Integer latestYear;

    HashMap<String, BaseParticipantPointStatistics> statistics = new HashMap<>();


    Context context;
    public Integer indexOfFilter;
    public ParticipantProfile profile;

    BaseRewardRecyclerViewAdapter(Context context, Integer indexOfFilter) {
        this.context = context;
        this.indexOfFilter = indexOfFilter;
    }

    @NonNull
    @Override
    public RewardViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.fragment_rewards_list_item, parent, false);
        return new RewardViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull RewardViewHolder holder, int position) {
        holder.showAll();
        showTitle(holder, position);
        BaseParticipantPointStatistics baseParticipantPointStatistics = getStatisticsOfPosition(position);
        holder.tvRedeemableRedeemed.setText(baseParticipantPointStatistics.pointsRedeemed.toString());
        holder.tvLifeTimeEarned.setText(baseParticipantPointStatistics.lifeTimePointsEarned.toString());
        holder.tvRedeemableEarned.setText(baseParticipantPointStatistics.redeemablePointsEarned.toString());
        if (baseParticipantPointStatistics.lifeTimePointsEarned == 0f) {
            holder.showNoRewards();
        }
    }

    protected abstract BaseParticipantPointStatistics getStatisticsOfPosition(int position);

    protected abstract void showTitle(RewardViewHolder holder, int position);

    public abstract void calStatistics();

    @Override
    public abstract int getItemCount();
}