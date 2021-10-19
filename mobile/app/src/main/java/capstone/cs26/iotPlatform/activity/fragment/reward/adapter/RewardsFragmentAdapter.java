package capstone.cs26.iotPlatform.activity.fragment.reward.adapter;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.lifecycle.Lifecycle;
import androidx.viewpager2.adapter.FragmentStateAdapter;

import capstone.cs26.iotPlatform.activity.fragment.reward.MonthlyRewardFragment;
import capstone.cs26.iotPlatform.activity.fragment.reward.QuarterlyRewardFragment;
import capstone.cs26.iotPlatform.activity.fragment.reward.YearlyRewardFragment;

public class RewardsFragmentAdapter extends FragmentStateAdapter {

    Fragment fragment;

    public RewardsFragmentAdapter(@NonNull FragmentManager fragmentManager, @NonNull Lifecycle lifecycle) {
        super(fragmentManager, lifecycle);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {

        switch (position) {
            case 0:
                fragment = new MonthlyRewardFragment();
                break;
            case 1:
                fragment = new QuarterlyRewardFragment();
                break;
            case 2:
                fragment = new YearlyRewardFragment();
                break;
        }
        return fragment;
    }

    @Override
    public int getItemCount() {
        return 3;
    }
}

