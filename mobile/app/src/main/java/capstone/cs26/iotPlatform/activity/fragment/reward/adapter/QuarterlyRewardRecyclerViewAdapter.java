package capstone.cs26.iotPlatform.activity.fragment.reward.adapter;

import android.content.Context;

import capstone.cs26.iotPlatform.activity.fragment.reward.RewardViewHolder;
import capstone.cs26.iotPlatform.model.BaseParticipantPointStatistics;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.QuarterParticipantPointStatistics;
import capstone.cs26.iotPlatform.util.Util;

public class QuarterlyRewardRecyclerViewAdapter extends BaseRewardRecyclerViewAdapter {
    public QuarterlyRewardRecyclerViewAdapter(Context context, Integer indexOfFilter) {
        super(context, indexOfFilter);
    }

    @Override
    protected BaseParticipantPointStatistics getStatisticsOfPosition(int position) {
        Integer year = latestYear - indexOfFilter;
        int valuablePosition = position + 1;
        String key = year + ":" + valuablePosition;
        return statistics.get(key);
    }

    @Override
    protected void showTitle(RewardViewHolder holder, int position) {
        Integer quarter = position + 1;
        holder.tvTitle.setText(Util.getQuarter(quarter));
    }

    @Override
    public void calStatistics() {
        for (int i = 0; i < yearsUsed; ++i) {
            int year = latestYear - i;
            for (int qtr = 1; qtr <= 4; ++qtr) {
                QuarterParticipantPointStatistics quarterParticipantPointStatistics =
                        new QuarterParticipantPointStatistics(year, qtr);
                if (profile != null && profile.pointStatistics != null) {
                    for (ParticipantProfile.ParticipantPointStatistics statistics : profile.pointStatistics) {
                        if (statistics.year.equals(year) && statistics.qtr.equals(qtr)) {
                            quarterParticipantPointStatistics.lifeTimePointsEarned += statistics.lifeTimePointsEarned;
                            quarterParticipantPointStatistics.pointsRedeemed += statistics.pointsRedeemed;
                            quarterParticipantPointStatistics.redeemablePointsEarned += statistics.redeemablePointsEarned;
                            break;
                        }
                    }
                }
                statistics.put(year + ":" + qtr, quarterParticipantPointStatistics);
            }
        }
    }

    @Override
    public int getItemCount() {
        if (latestYear == null || earliestYear == null) return 0;
        return 4;
    }
}
