package capstone.cs26.iotPlatform.activity.fragment.reward;

import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;

import java.util.ArrayList;

import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.BaseRewardRecyclerViewAdapter;
import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.MonthlyRewardRecyclerViewAdapter;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.YearParticipantPointStatistics;

public class MonthlyRewardFragment extends BaseRewardFragment {
    String selectedYear;

    @Override
    protected BaseRewardRecyclerViewAdapter createAdapter() {
        return new MonthlyRewardRecyclerViewAdapter(getContext(), 0);
    }

    @Override
    protected void checkSelectedYear() {
        if (selectedYear != null)
            for (int i = 0; i < spYearFilter.getAdapter().getCount(); ++i) {
                if (spYearFilter.equals(spYearFilter.getAdapter().getItem(i))) {
                    spYearFilter.setSelection(i);
                    return;
                }
            }
    }

    @Override
    protected void setFilter() {
        ArrayList<String> list = new ArrayList<>();
        for (Integer i = rewardsFragmentAdapter.latestYear; i >= rewardsFragmentAdapter.earliestYear; --i) {
            list.add(i.toString());
        }
        ArrayAdapter<String> adp = new ArrayAdapter<String>(getContext(), android.R.layout.simple_spinner_dropdown_item,
                list);
        spYearFilter.setAdapter(adp);
        spYearFilter.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                rewardsFragmentAdapter.indexOfFilter = position;
                rewardsFragmentAdapter.notifyDataSetChanged();
                selectedYear = (String) spYearFilter.getSelectedItem();
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });
        adp.notifyDataSetChanged();
    }

    @Override
    protected void setTotalLifeTimeAndRedeemable() {
        if (latestYear == null) return;
        int year = latestYear - spYearFilter.getSelectedItemPosition();
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
        tvLifetimePoints.setText(yearParticipantPointStatistics.lifeTimePointsEarned.toString());
        tvRedeemablePoints.setText(yearParticipantPointStatistics.redeemablePointsEarned.toString());
    }
}
