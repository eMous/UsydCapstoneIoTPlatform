package capstone.cs26.iotPlatform.activity.fragment.reward.adapter;

import android.content.Context;

import capstone.cs26.iotPlatform.activity.fragment.reward.RewardViewHolder;
import capstone.cs26.iotPlatform.model.BaseParticipantPointStatistics;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.YearParticipantPointStatistics;

public class YearlyRewardRecyclerViewAdapter extends BaseRewardRecyclerViewAdapter {
    public YearlyRewardRecyclerViewAdapter(Context context, Integer indexOfFilter) {
        super(context, indexOfFilter);
    }

    @Override
    protected BaseParticipantPointStatistics getStatisticsOfPosition(int position) {
        int year = latestYear - position;
        return statistics.get(Integer.toString(year));
    }

    @Override
    protected void showTitle(RewardViewHolder holder, int position) {
        int year = latestYear - position;
        holder.tvTitle.setText(Integer.toString(year));
    }

    @Override
    public int getItemCount() {
        if (latestYear == null || earliestYear == null) return 0;
        return yearsUsed;
    }

    @Override
    public void calStatistics() {
        for (int i = 0; i < yearsUsed; ++i) {
            Integer year = latestYear - i;
            YearParticipantPointStatistics yearParticipantPointStatistics =
                    new YearParticipantPointStatistics(year);
            if (profile != null && profile.pointStatistics != null) {
                for (ParticipantProfile.ParticipantPointStatistics statistics : profile.pointStatistics) {
                    if (statistics.year.equals(year)) {
                        yearParticipantPointStatistics.lifeTimePointsEarned += statistics.lifeTimePointsEarned;
                        yearParticipantPointStatistics.pointsRedeemed += statistics.pointsRedeemed;
                        yearParticipantPointStatistics.redeemablePointsEarned += statistics.redeemablePointsEarned;
                    }
                }
            }
            statistics.put(year.toString(), yearParticipantPointStatistics);
        }
    }
}
