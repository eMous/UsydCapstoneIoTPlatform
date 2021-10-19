package capstone.cs26.iotPlatform.activity.fragment.reward;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.tabs.TabLayout;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.activity.fragment.reward.adapter.RewardsFragmentAdapter;

public class RewardsFragment extends Fragment {

    TabLayout tabLayout;
    ViewPager2 viewPager;
    RewardsFragmentAdapter rewardsAdapter;
    View root;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        root = inflater.inflate(R.layout.fragment_rewards, container, false);
        initUI();
        return root;
    }

    private void initUI() {
        tabLayout = root.findViewById(R.id.RewardsTabLayout);
        viewPager = root.findViewById(R.id.viewPager);

        FragmentManager fragManager = getChildFragmentManager();
        rewardsAdapter = new RewardsFragmentAdapter( fragManager, getLifecycle());
        viewPager.setAdapter(rewardsAdapter);

        tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                viewPager.setCurrentItem(tab.getPosition());
            }

            @Override
            public void onTabUnselected(TabLayout.Tab tab) {

            }

            @Override
            public void onTabReselected(TabLayout.Tab tab) {

            }
        });

        viewPager.registerOnPageChangeCallback(new ViewPager2.OnPageChangeCallback() {
            @Override
            public void onPageSelected(int position) {
                tabLayout.selectTab(tabLayout.getTabAt(position));
            }
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        ((MainActivity)getActivity()).setFragmentTitle("Rewards");
        ((MainActivity)getActivity()).enableSwipeRefresh(false);
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
    }
}