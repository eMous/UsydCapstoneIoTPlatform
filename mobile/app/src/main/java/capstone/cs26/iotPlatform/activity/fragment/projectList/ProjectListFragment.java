/**
 * @author: Nelson Goh
 */

package capstone.cs26.iotPlatform.activity.fragment.projectList;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;

public class ProjectListFragment extends Fragment  {

    // RecyclerView for the list of projects
    public RecyclerView recyclerView;
    // The adapter for the RecyclerView
    private ProjectListAdapter projectListAdapter;

    public TextView noProjectToDisplay;



    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View root = inflater.inflate(R.layout.fragment_project_list, container, false);
        noProjectToDisplay= root.findViewById(R.id.noProject);
        recyclerView = root.findViewById(R.id.projectListRecyclerView);
        projectListAdapter = new ProjectListAdapter(getContext(), this);
        recyclerView.setAdapter(projectListAdapter);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        return root;
    }

    @Override
    public void onResume() {
        super.onResume();
        projectListAdapter.onResume();
        ((MainActivity) getActivity()).setFragmentTitle("Projects");
        ((MainActivity) getActivity()).enableSwipeRefresh(true);
    }

    @Override
    public void onPause() {
        super.onPause();
        projectListAdapter.onPause();
    }

}
