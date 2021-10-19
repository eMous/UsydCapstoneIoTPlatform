package capstone.cs26.iotPlatform.activity.fragment.reward;

import android.view.View;

import java.util.Iterator;

import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.BaseRewardRecyclerViewAdapter;
import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.YearlyRewardRecyclerViewAdapter;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.YearParticipantPointStatistics;

public class YearlyRewardFragment extends BaseRewardFragment {

    @Override
    protected BaseRewardRecyclerViewAdapter createAdapter() {
        return new YearlyRewardRecyclerViewAdapter(getContext(), 0);
    }

    @Override
    protected void checkSelectedYear() {
    }

    @Override
    protected void setTotalLifeTimeAndRedeemable() {
        YearParticipantPointStatistics allYearParticipantPointStatistics =
                new YearParticipantPointStatistics(0);
        for (int i = 0; i < yearsUsed; ++i) {
            Integer year = latestYear - i;
            if (profile != null && profile.pointStatistics != null) {
                Iterator<ParticipantProfile.ParticipantPointStatistics> iterator = profile.pointStatistics.iterator();
                while (iterator.hasNext()) {
                    ParticipantProfile.ParticipantPointStatistics statistics = iterator.next();
                    if (statistics.year.equals(year)) {
                        allYearParticipantPointStatistics.lifeTimePointsEarned += statistics.lifeTimePointsEarned;
                        allYearParticipantPointStatistics.pointsRedeemed += statistics.pointsRedeemed;
                        allYearParticipantPointStatistics.redeemablePointsEarned += statistics.redeemablePointsEarned;
                    }
                }
            }
        }
        tvLifetimePoints.setText(allYearParticipantPointStatistics.lifeTimePointsEarned.toString());
        tvRedeemablePoints.setText(allYearParticipantPointStatistics.redeemablePointsEarned.toString());
    }

    @Override
    protected void setFilter() {
        spYearFilter.setVisibility(View.GONE);
    }

}
