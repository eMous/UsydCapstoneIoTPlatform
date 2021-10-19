package capstone.cs26.iotPlatform.activity.fragment.notificationList;

import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.widget.AppCompatImageView;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.HashMap;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.activity.MainActivity;
import capstone.cs26.iotPlatform.model.AnswerInvitationRequestModel;
import capstone.cs26.iotPlatform.model.DataRetrieveCloseRequestModel;
import capstone.cs26.iotPlatform.model.Notification;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.RetrieveDataNotification;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.IRender;

public class NotificationAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> implements IRender {
    private final NotificationFragment fragment;
    ParticipantNotifications participantNotifications;
    int INVITATION_TYPE = 0;
    int RETRIEVE_TYPE = 1;
    ArrayList<Notification> notifications = new ArrayList<>();
    private Context mContext;

    public NotificationAdapter(Context context, NotificationFragment fragment) {
        mContext = context;
        this.fragment = fragment;
        CachedModels cachedModels = ((MainActivity) fragment.getActivity()).cachedModels;
        render(cachedModels);
        cachedModels.registerCurrentFragment(this);
    }

    public void onPause() {
        ((MainActivity) fragment.getActivity()).cachedModels.removeCurrentFragment(this);
    }

    public void onResume() {
        ((MainActivity) fragment.getActivity()).cachedModels.registerCurrentFragment(this);
    }

    @NonNull
    @Override
    public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        RecyclerView.ViewHolder vh = null;
        if (viewType == INVITATION_TYPE) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.fragment_notification_row, parent, false);
            // set the view's size, margins, paddings and layout parameters
            vh = new InvitationViewHolder(v);
        } else if (viewType == RETRIEVE_TYPE) {
            View v = LayoutInflater.from(parent.getContext())
                    .inflate(R.layout.fragment_notification_row_data_used, parent, false);
            // set the view's size, margins, paddings and layout parameters
            vh = new DataRetrieveViewHolder(v);
        }
        return vh;
    }

    @Override
    public void onBindViewHolder(@NonNull RecyclerView.ViewHolder holder, int position) {
        int viewType = getItemViewType(position);
        Notification notification = notifications.get(position);
        if (viewType == INVITATION_TYPE) {
            ParticipantNotifications.UnhandedInvitation unhandedInvitation = (ParticipantNotifications.UnhandedInvitation) notification.notificationObj;
            if (unhandedInvitation != null) {
                String corrsProjId = unhandedInvitation.projectId;
                if (corrsProjId != null) {
                    ((InvitationViewHolder) holder).bindNotificationInfo(corrsProjId);
                }
            }
        } else if (viewType == RETRIEVE_TYPE) {
            RetrieveDataNotification retrieveDataNotification = (RetrieveDataNotification) notification.notificationObj;
            if (retrieveDataNotification != null) {
                String retrieveId = retrieveDataNotification.retrievalId;
                if (retrieveId != null && retrieveDataNotification != null) {
                    ((DataRetrieveViewHolder) holder).bindNotificationInfo(retrieveDataNotification);
                }
            }
        }
    }

    @Override
    public int getItemViewType(int position) {
        String type = notifications.get(position).notificationType;
        if (type.equals("UnhandedInvitation")) return INVITATION_TYPE;
        if (type.equals("RetrieveDataNotification")) return RETRIEVE_TYPE;
        return -1;
    }

    @Override
    public int getItemCount() {
        return notifications.size();
    }

    @Override
    public void render(CachedModels cachedModels) {
        participantNotifications = cachedModels.parNot;
        if (participantNotifications == null) {
            fragment.recyclerView.setVisibility(View.GONE);
            fragment.noNotificationToDisplay.setVisibility(View.VISIBLE);
            return;
        }
        notifications = participantNotifications.getNotifications();
        if (notifications.isEmpty()) {
            fragment.recyclerView.setVisibility(View.GONE);
            fragment.noNotificationToDisplay.setVisibility(View.VISIBLE);
        } else {
            fragment.recyclerView.setVisibility(View.VISIBLE);
            fragment.noNotificationToDisplay.setVisibility(View.GONE);
        }
        notifyDataSetChanged();
    }


    public class InvitationViewHolder extends RecyclerView.ViewHolder {
        // each data item is just a string in this case
        public ImageView imageViewPrj;
        public TextView textViewPrjTitle;
        public TextView textViewPrjDesc;
        public Button btnAccept;
        public Button btnReject;
        public View layout;

        public InvitationViewHolder(View v) {
            super(v);
            mContext = v.getContext();
            layout = v;
            textViewPrjTitle = v.findViewById(R.id.notificationTitle);
            textViewPrjDesc = v.findViewById(R.id.notificationDescription);
            btnAccept = v.findViewById(R.id.btAccept);
            btnReject = v.findViewById(R.id.btReject);
        }

        public void bindNotificationInfo(String projId) {
            if (participantNotifications.prjDetails == null) return;
            HashMap<String, String> projDetails = participantNotifications.prjDetails.get(projId);
            // If we have project details corresponding to this project ID, i.e. not null
            if (projDetails != null) {
                String projTitle = projDetails.get("prjTitle");
                String projDesc = projDetails.get("prjDescription");
                // If the project title and description are available
                if (projTitle != null && projDesc != null) {
                    // We display it
                    textViewPrjTitle.setText(projTitle);
                    textViewPrjDesc.setText(projDesc);
                    itemView.setOnClickListener(view -> {
                        Bundle bundle = new Bundle();
                        bundle.putString("prjId", projId);
                        bundle.putBoolean("isIn", false);
                        ((MainActivity) fragment.getActivity()).navController.navigate(R.id.projectDetailsFragment,
                                bundle);
                    });
                    btnAccept.setOnClickListener(btn -> {
                        AnswerInvitationRequestModel answerInvitationRequestModel =
                                new AnswerInvitationRequestModel(projId, true);
                        answerInvitationRequestModel.answer(mContext, () -> {
                            Handler handler = new Handler(Looper.getMainLooper());
                            handler.postDelayed(fragment::goToProjectListLogic, 250);

                        });
                    });
                    btnReject.setOnClickListener(btn -> {
                        AnswerInvitationRequestModel answerInvitationRequestModel =
                                new AnswerInvitationRequestModel(projId, false);
                        answerInvitationRequestModel.answer(mContext, () -> {
                            Handler handler = new Handler(Looper.getMainLooper());
                            handler.postDelayed(fragment::goToProjectListLogic, 250);
                        });
                    });
                }
            }
        }
    }

    public class DataRetrieveViewHolder extends RecyclerView.ViewHolder {
        TextView tvRetrieveTitle;
        TextView tvRetrieveDescription;
        AppCompatImageView ivClose;

        public DataRetrieveViewHolder(@NonNull View itemView) {
            super(itemView);
            tvRetrieveTitle = itemView.findViewById(R.id.notificationTitle);
            tvRetrieveDescription = itemView.findViewById(R.id.notificationDescription);
            ivClose = itemView.findViewById(R.id.iv_cancel);
        }

        public void bindNotificationInfo(RetrieveDataNotification retrieveDataNotification) {
            HashMap<String, HashMap<String, String>> prjs = participantNotifications.prjDetails;
            String prjId = retrieveDataNotification.projectId;
            if (prjId == null || prjs == null) return;
            HashMap<String, String> prj = prjs.get(prjId);
            if (prj == null) return;
            String title = prj.get("prjTitle");

            tvRetrieveTitle.setText("Your data has been downloaded!");
            tvRetrieveDescription.setText("Your data has been downloaded for Project: " + title);
            ivClose.setOnClickListener(v -> {
                DataRetrieveCloseRequestModel dataRetrieveCloseRequestModel =
                        new DataRetrieveCloseRequestModel(retrieveDataNotification.retrievalId);
                dataRetrieveCloseRequestModel.request(mContext, () -> {
                    Handler handler = new Handler(Looper.getMainLooper());
                    handler.postDelayed(fragment::goToProjectListLogic, 250);
                });
            });
        }
    }
}
