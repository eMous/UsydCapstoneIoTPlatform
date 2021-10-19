package capstone.cs26.iotPlatform.activity.fragment.notificationList;

import android.os.Bundle;
import android.os.Handler;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;

public class NotificationFragment extends Fragment {

    static final String TAG = "NotificationFragment";
    public RecyclerView recyclerView;
    public TextView noNotificationToDisplay;
    MutableLiveData<Boolean> liveDataReturnedFromDetailPage;
    Observer<Boolean> backFromDetailPageObserver;
    NavController navController;
    private NotificationAdapter adapter;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_notification, container, false);
        noNotificationToDisplay = root.findViewById(R.id.noNotification);

        recyclerView = root.findViewById(R.id.notificationRecyclerView);
        adapter = new NotificationAdapter(getContext(), this);
        recyclerView.setAdapter(adapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));


        navController = NavHostFragment.findNavController(this);
        liveDataReturnedFromDetailPage = navController.getCurrentBackStackEntry().getSavedStateHandle()
                .getLiveData("backFromDetailFragment");
        backFromDetailPageObserver = this::onBackFromDetailPageChanged;
        liveDataReturnedFromDetailPage.observe(getViewLifecycleOwner(), this::onBackFromDetailPageChanged);
        return root;
    }

    private void onBackFromDetailPageChanged(Boolean back) {
        if (back == null || !back) return;
        liveDataReturnedFromDetailPage.postValue(false);
        goToProjectListLogic();
    }

    public void goToProjectListLogic() {
        new Handler().postDelayed(() -> {

            if (adapter.notifications == null) {
                // hack
                navController.popBackStack();
                navController.navigate(R.id.new_nav_proj_list);
                return;
            }
            if (adapter.notifications.size() == 0) {
                navController.popBackStack();
                navController.navigate(R.id.new_nav_proj_list);
                return;
            }
        }, 200);
    }

    @Override
    public void onResume() {
        super.onResume();
        adapter.onResume();
        ((MainActivity) getActivity()).setFragmentTitle("Notifications");
        ((MainActivity) getActivity()).enableSwipeRefresh(true);

    }

    @Override
    public void onPause() {
        super.onPause();
        adapter.onPause();
    }
}

