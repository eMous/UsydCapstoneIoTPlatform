package capstone.cs26.iotPlatform.activity.fragment.reward.adapter;

import android.content.Context;

import capstone.cs26.iotPlatform.activity.fragment.reward.RewardViewHolder;
import capstone.cs26.iotPlatform.model.BaseParticipantPointStatistics;
import capstone.cs26.iotPlatform.model.MonthParticipantPointStatistics;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.util.Util;

public class MonthlyRewardRecyclerViewAdapter extends BaseRewardRecyclerViewAdapter {
    public MonthlyRewardRecyclerViewAdapter(Context context, Integer indexOfFilter) {
        super(context, indexOfFilter);
    }

    @Override
    protected BaseParticipantPointStatistics getStatisticsOfPosition(int position) {
        Integer year = latestYear - indexOfFilter;
        Integer valuablePosition = position + 1;
        String key = year + ":" + valuablePosition;
        BaseParticipantPointStatistics ret = statistics.get(key);
        return ret;
    }

    @Override
    protected void showTitle(RewardViewHolder holder, int position) {
        Integer month = position + 1;
        holder.tvTitle.setText(Util.getMonthStr(month));
    }

    @Override
    public void calStatistics() {
        for (int i = 0; i < yearsUsed; ++i) {
            int year = latestYear - i;
            for (int mth = 1; mth <= 12; ++mth) {
                MonthParticipantPointStatistics monthParticipantPointStatistics =
                        new MonthParticipantPointStatistics(year, mth);
                if (profile != null && profile.pointStatistics != null) {
                    for (ParticipantProfile.ParticipantPointStatistics statistics : profile.pointStatistics) {
                        if (statistics.year.equals(year) && statistics.mth.equals(mth - 1)) {
                            monthParticipantPointStatistics.lifeTimePointsEarned += statistics.lifeTimePointsEarned;
                            monthParticipantPointStatistics.pointsRedeemed += statistics.pointsRedeemed;
                            monthParticipantPointStatistics.redeemablePointsEarned += statistics.redeemablePointsEarned;
                            break;
                        }
                    }
                }
                statistics.put(year + ":" + mth, monthParticipantPointStatistics);
            }
        }
    }

    @Override
    public int getItemCount() {
        if (latestYear == null || earliestYear == null) return 0;
        return 12;
    }
}
