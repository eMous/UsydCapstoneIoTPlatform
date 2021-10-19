package capstone.cs26.iotPlatform.activity.fragment.sensorSetting;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ExpandableListView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;

import java.util.ArrayList;
import java.util.HashMap;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.SimpleSensor;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class SensorsInfoFragment extends Fragment implements IRender {
    private static final String TAG = "SensorsInfoFragment";
    ExpandableListView expandableListView;
    ArrayList<Integer> listGroup;
    HashMap<Integer, ArrayList<String>> listItem;
    SensorsInfoListAdapter adapter;
    View root;
    Observer<ParticipantProfile> profileObserver;
    public View onCreateView(@NonNull LayoutInflater inflater,
                             ViewGroup container, Bundle savedInstanceState) {
        root = inflater.inflate(R.layout.frgament_settings_sensors, container, false);
        expandableListView = root.findViewById(R.id.expandable_list_view);
        listGroup = new ArrayList<>();
        listItem = new HashMap<>();
        render(((MainActivity)getActivity()).cachedModels);
        return root;
    }

    @Override
    public void onDestroy() {
        Log.e(TAG,"onDestroy");
        super.onDestroy();
    }

    @Override
    public void onPause() {
        super.onPause();
        adapter = null;
        ((MainActivity) getActivity()).cachedModels.removeCurrentFragment(this);
    }

    @Override
    public void onResume() {
        super.onResume();
        CachedModels cachedModels = ((MainActivity) getActivity()).cachedModels;
        cachedModels.registerCurrentFragment(this);

        ((MainActivity)getActivity()).setFragmentTitle("Sensor Settings");
        ((MainActivity)getActivity()).enableSwipeRefresh(true);
    }

    @Override
    public void render(CachedModels cachedModels) {
        ParticipantProfile participantProfile = cachedModels.profile;
        if (participantProfile != null){
            ArrayList<SimpleSensor> sensorsInDevice = participantProfile.sensorsInDevice;
            if (sensorsInDevice.size() != 0){
                listGroup = new ArrayList<>();
                listItem = new HashMap<>();
                for (int i = 0; i < sensorsInDevice.size(); ++i){
                    final SimpleSensor sensor = sensorsInDevice.get(i);
                    Integer sensorType = sensor.type;
                    if (!listGroup.contains(sensorType)){
                        listGroup.add(sensorType);
                    }
                    if (listItem.get(sensorType) == null){
                        listItem.put(sensorType,new ArrayList<String>());
                    }
                    ArrayList<String> xTypeSensors = listItem.get(sensorType);
                    xTypeSensors.add(sensor.name);
                }
            }
            if (adapter == null){
                adapter = new SensorsInfoListAdapter(getContext(),listGroup,listItem,participantProfile);
                expandableListView.setAdapter(adapter);
            }else{
                adapter.reInitiate(getContext(),listGroup,listItem,participantProfile);
            }
            adapter.notifyDataSetChanged();
        }
    }
}
