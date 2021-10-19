package capstone.cs26.iotPlatform.activity.fragment.sensorSetting;

import android.content.Context;
import android.content.DialogInterface;
import android.hardware.Sensor;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseExpandableListAdapter;
import android.widget.ImageView;
import android.widget.Switch;
import android.widget.TextView;

import androidx.appcompat.app.AlertDialog;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.button.MaterialButtonToggleGroup;

import java.util.ArrayList;
import java.util.HashMap;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.db.AppDatabase;
import capstone.cs26.iotPlatform.http.HttpUtil;
import capstone.cs26.iotPlatform.http.URLs;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.PostProfileRequestModel;
import capstone.cs26.iotPlatform.model.SensorConf;
import capstone.cs26.iotPlatform.model.SimpleSensor;
import capstone.cs26.iotPlatform.util.SensorUtil;

public class SensorsInfoListAdapter extends BaseExpandableListAdapter {

    Context context;
    ArrayList<Integer> listGroup;
    HashMap<Integer, ArrayList<String>> listItem;
    ArrayList<SensorConf> sensorConfs;
    ParticipantProfile participantProfile;

    public SensorsInfoListAdapter(Context context, ArrayList<Integer> listGroup,
                                  HashMap<Integer, ArrayList<String>> listItem, ParticipantProfile participantProfile) {
        this.context = context;
        this.listGroup = listGroup;
        this.listItem = listItem;
        this.participantProfile = participantProfile;
        this.sensorConfs = participantProfile.sensorConfsTemplate;
    }

    public void reInitiate(Context context, ArrayList<Integer> listGroup,
                           HashMap<Integer, ArrayList<String>> listItem, ParticipantProfile participantProfile) {
        this.context = context;
        this.listGroup = listGroup;
        this.listItem = listItem;
        this.participantProfile = participantProfile;
        this.sensorConfs = participantProfile.sensorConfsTemplate;
    }

    @Override
    public int getGroupCount() {
        return listGroup.size();
    }

    @Override
    public int getChildrenCount(int groupPosition) {
        return this.listItem.get(this.listGroup.get(groupPosition)).size();
    }

    @Override
    public Object getGroup(int groupPosition) {
        return this.listGroup.get(groupPosition);
    }

    @Override
    public Object getChild(int groupPosition, int childPosition) {
        return this.listItem.get(this.listGroup.get(groupPosition)).get(childPosition);
    }

    @Override
    public long getGroupId(int groupPosition) {
        return groupPosition;
    }

    @Override
    public long getChildId(int groupPosition, int childPosition) {
        return childPosition;
    }

    @Override
    public boolean hasStableIds() {
        return false;
    }

    @Override
    public View getGroupView(int groupPosition, boolean isExpanded, View convertView, ViewGroup parent) {
        GroupViewHolder gVH;
        Integer typeId = (Integer) getGroup(groupPosition);
        if (convertView == null) {
            LayoutInflater layoutInflater = (LayoutInflater) this.context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = layoutInflater.inflate(R.layout.fragment_settings_sensors_sensor_info_type, null);
            gVH = new GroupViewHolder();
            convertView.setTag(gVH);
            gVH.tvTypeName = convertView.findViewById(R.id.tv_sensor_type_name);
            gVH.ivInfo = convertView.findViewById(R.id.iv_sensor_type_info);
        } else {
            gVH = (GroupViewHolder) convertView.getTag();
        }
        gVH.tvTypeName.setText(SensorUtil.getSensorTypeStr(typeId));
        gVH.ivInfo.setOnClickListener(view -> {
            AlertDialog dialog;
            dialog = new AlertDialog.Builder(context)
                    .setTitle(SensorUtil.getSensorTypeStr(typeId))
                    .setMessage(SensorUtil.getSensorTypeInformation(typeId)).setPositiveButton("OK", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    }).create();
            dialog.show();
        });
        return convertView;
    }

    class GroupViewHolder {
        TextView tvTypeName;
        ImageView ivInfo;
    }

    class ChildViewHolder {
        String sensorId;
        TextView tvSensorName;
        MaterialButtonToggleGroup toggleGroup;
        MaterialButton btnLow;
        MaterialButton btnMid;
        MaterialButton btnHigh;
        Switch swEnable;
    }

    public void disableSensor(ChildViewHolder cVH) {
        cVH.toggleGroup.setSelectionRequired(false);
        cVH.btnLow.setChecked(false);
        cVH.btnLow.setEnabled(false);

        cVH.btnMid.setChecked(false);
        cVH.btnMid.setEnabled(false);

        cVH.btnHigh.setChecked(false);
        cVH.btnHigh.setEnabled(false);
    }

    public void enableSensor(ChildViewHolder cVH, Integer frequency) {
        cVH.toggleGroup.setSelectionRequired(true);
        cVH.btnLow.setEnabled(true);
        cVH.btnMid.setEnabled(true);
        cVH.btnHigh.setEnabled(true);

        MaterialButton btnToCheck = null;
        if (frequency.equals(SensorUtil.FREQUENCY_LOW)) {
            btnToCheck = cVH.btnLow;
        }
        if (frequency.equals(SensorUtil.FREQUENCY_MIDDLE)) {
            btnToCheck = cVH.btnMid;
        }
        if (frequency.equals(SensorUtil.FREQUENCY_HIGH)) {
            btnToCheck = cVH.btnHigh;
        }
        if (btnToCheck != null) {
            btnToCheck.setChecked(true);
        }
    }

    @Override
    public View getChildView(int groupPosition, int childPosition, boolean isLastChild, View convertView, ViewGroup parent) {
        ChildViewHolder cVH;
        String sensorName = (String) getChild(groupPosition, childPosition);
        if (convertView == null) {
            LayoutInflater layoutInflater = (LayoutInflater) this.context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = layoutInflater.inflate(R.layout.fragment_settings_sensors_row, null);
            cVH = new ChildViewHolder();
            convertView.setTag(cVH);
            cVH.tvSensorName = convertView.findViewById(R.id.tv_sensor_name);
            cVH.toggleGroup = convertView.findViewById(R.id.toggleGroup);
            cVH.btnLow = convertView.findViewById(R.id.btn_low);
            cVH.btnMid = convertView.findViewById(R.id.btn_medium);
            cVH.btnHigh = convertView.findViewById(R.id.btn_high);
            cVH.swEnable = convertView.findViewById(R.id.sw_enable);
        } else {
            cVH = (ChildViewHolder) convertView.getTag();
        }
        disableSensor(cVH);
        cVH.tvSensorName.setText(sensorName);
        cVH.sensorId = new SimpleSensor(sensorName, (Integer) getGroup(groupPosition)).id;
        cVH.btnLow.setOnClickListener(view -> {
            tellServerEnableSensor(cVH.sensorId, SensorUtil.FREQUENCY_LOW);
        });
        cVH.btnMid.setOnClickListener(view -> {
            tellServerEnableSensor(cVH.sensorId, SensorUtil.FREQUENCY_MIDDLE);
        });
        cVH.btnHigh.setOnClickListener(view -> {
            tellServerEnableSensor(cVH.sensorId, SensorUtil.FREQUENCY_HIGH);
        });
        cVH.swEnable.setOnClickListener(view -> {
            if (cVH.swEnable.isChecked()) {
                enableSensor(cVH, -1);
            } else {
                disableSensor(cVH);
                tellServerDisableSensor(cVH.sensorId);
            }
        });
        cVH.swEnable.setChecked(false);

        for (int i = 0; i < sensorConfs.size(); ++i) {
            SensorConf xSensorConf = sensorConfs.get(i);
            String xSensorId = xSensorConf.enabledSensorId;
            Sensor xSensor = SensorUtil.getSensor(xSensorId, context);

            String xSensorName = xSensor.getName();
            int xSensorType = xSensor.getType();
            if (xSensorName.equals(sensorName) && xSensorType == (Integer) getGroup(groupPosition)) {
                cVH.swEnable.setChecked(true);
                enableSensor(cVH, xSensorConf.sensorFrequency);
            }
        }

        // Check in a project
        ArrayList<ParticipantProfile.ProjectInParticipantProfile> prjInPars = participantProfile.projects;
        boolean inProject = false;
        for (int i = 0; i < prjInPars.size(); ++i) {
            ParticipantProfile.ProjectInParticipantProfile prjInPar = prjInPars.get(i);
            if (prjInPar.leaveTime != null) continue;
            if (prjInPar.prjComplete) continue;
            inProject = true;
            break;
        }

        if (inProject) {
            cVH.btnLow.setClickable(false);
            cVH.btnMid.setClickable(false);
            cVH.btnHigh.setClickable(false);
            cVH.swEnable.setClickable(false);
        }
        return convertView;
    }

    private void tellServerEnableSensor(String sensorId, Integer frequency) {
        SensorConf sensorConfToChange = null;
        for (SensorConf sensorConf : sensorConfs) {
            if (sensorConf.enabledSensorId.equals(sensorId)) {
                if (sensorConf.sensorFrequency.equals(frequency)) {
                    return;
                }
                sensorConfToChange = sensorConf;
                sensorConf.sensorFrequency = frequency;
                break;
            }
        }
        if (sensorConfToChange == null) {
            sensorConfs.add(new SensorConf(sensorId, frequency));
        }
        HttpUtil.post(URLs.GetProfileUrl(), new PostProfileRequestModel(sensorConfs),
                ParticipantProfile.class,
                profileResponse -> {
                    AppDatabase.databaseWriteExecutor.execute(() -> {
                        AppDatabase.getInstance(context).participantProfileDao().upsert(profileResponse);
                    });
                }, context);
    }


    void tellServerDisableSensor(String sensorId) {
        SensorConf sensorConfToRemove = null;
        for (SensorConf sensorConf : sensorConfs) {
            if (sensorConf.enabledSensorId.equals(sensorId)) {
                sensorConfToRemove = sensorConf;
                break;
            }
        }

        if (sensorConfToRemove != null) {
            sensorConfs.remove(sensorConfToRemove);
            HttpUtil.post(URLs.GetProfileUrl(), new PostProfileRequestModel(sensorConfs),
                    ParticipantProfile.class,
                    profileResponse -> {
                        AppDatabase.databaseWriteExecutor.execute(() -> {
                            AppDatabase.getInstance(context).participantProfileDao().upsert(participantProfile);
                        });
                    }, context);
        }
    }

    @Override
    public boolean isChildSelectable(int groupPosition, int childPosition) {
        return false;
    }
}
