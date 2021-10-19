package capstone.cs26.iotPlatform.activity.fragment.reward;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Spinner;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.core.widget.NestedScrollView;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.BaseRewardRecyclerViewAdapter;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.YearUsed;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public abstract class BaseRewardFragment extends Fragment implements IRender {
    TextView tvLifetimePoints;
    TextView tvRedeemablePoints;
    Spinner spYearFilter;
    RecyclerView rcvPoints;
    TextView tvNoPoints;
    NestedScrollView scrollView;
    View root;

    BaseRewardRecyclerViewAdapter rewardsFragmentAdapter;

    ParticipantProfile profile;
    Integer latestYear;
    Integer yearsUsed;

    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {

        root = inflater.inflate(R.layout.fragment_rewards_template, container, false);
        initUI();

        rewardsFragmentAdapter = createAdapter();
        rcvPoints.setLayoutManager(new LinearLayoutManager(getContext()));
        rcvPoints.setAdapter(rewardsFragmentAdapter);

        render(((MainActivity)getActivity()).cachedModels);
        return root;
    }

    protected abstract BaseRewardRecyclerViewAdapter createAdapter();

    protected abstract void checkSelectedYear();

    protected abstract void setTotalLifeTimeAndRedeemable();

    private void initUI() {
        tvLifetimePoints = root.findViewById(R.id.tvLifetimePoints);
        tvRedeemablePoints = root.findViewById(R.id.tvRedeemablePoints);
        spYearFilter = root.findViewById(R.id.spYearFilter);
        rcvPoints = root.findViewById(R.id.lvPoints);
        tvNoPoints = root.findViewById(R.id.tvNoPoints);
        scrollView = root.findViewById(R.id.scrollview);
    }

    protected abstract void setFilter();

    public void render(CachedModels cachedModels) {
        profile = cachedModels.profile;
        if (profile == null || profile.pointStatistics == null) return;
        YearUsed yearUsedObj = profile.getYearUsed();
        yearsUsed = yearUsedObj.yearsUsed;

        if (yearUsedObj.yearsUsed == 0) {
            scrollView.setVisibility(View.INVISIBLE);
            tvNoPoints.setVisibility(View.VISIBLE);
            return;
        } else {
            scrollView.setVisibility(View.VISIBLE);
            tvNoPoints.setVisibility(View.INVISIBLE);
        }

        rewardsFragmentAdapter.profile = profile;
        rewardsFragmentAdapter.earliestYear = yearUsedObj.earliestYear;
        rewardsFragmentAdapter.latestYear = yearUsedObj.latestYear;
        rewardsFragmentAdapter.yearsUsed = yearsUsed;
        latestYear = yearUsedObj.latestYear;

        rewardsFragmentAdapter.calStatistics();
        setFilter();
        rewardsFragmentAdapter.notifyDataSetChanged();
        setTotalLifeTimeAndRedeemable();

        checkSelectedYear();
    }

    @Override
    public void onPause() {
        super.onPause();
        ((MainActivity)getActivity()).cachedModels.removeCurrentFragment(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        CachedModels cachedModels = ((MainActivity) getActivity()).cachedModels;
        cachedModels.registerCurrentFragment(this);
    }
}
