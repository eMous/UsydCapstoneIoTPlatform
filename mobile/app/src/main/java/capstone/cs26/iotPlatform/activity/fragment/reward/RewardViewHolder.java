package capstone.cs26.iotPlatform.activity.fragment.reward;

import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import capstone.cs26.iotPlatform.R;

public class RewardViewHolder extends RecyclerView.ViewHolder {
    public TextView tvTitle;

    public TextView tvLifeTimeTitle;
    public TextView tvLifeTimeEarned;

    public TextView tvRedeemableTitle;
    public TextView tvRedeemableEarned;

    public TextView tvRedeemedTitle;
    public TextView tvRedeemableRedeemed;

    public RewardViewHolder(@NonNull View itemView) {
        super(itemView);
        tvTitle = itemView.findViewById(R.id.tvTitle);

        tvLifeTimeTitle = itemView.findViewById(R.id.tvLifeTimeTitle);
        tvLifeTimeEarned = itemView.findViewById(R.id.tvLifeTimeEarned);

        tvRedeemableTitle = itemView.findViewById(R.id.tvRedeemableTitle);
        tvRedeemableEarned = itemView.findViewById(R.id.tvRedeemableEarned);

        tvRedeemedTitle = itemView.findViewById(R.id.tvRedeemedTitle);
        tvRedeemableRedeemed = itemView.findViewById(R.id.tvRedeemableRedeemed);
    }

    public void showAll() {
        tvLifeTimeTitle.setVisibility(View.VISIBLE);
        tvLifeTimeEarned.setVisibility(View.VISIBLE);
        tvRedeemableTitle.setVisibility(View.VISIBLE);
        tvRedeemableEarned.setVisibility(View.VISIBLE);
        tvRedeemedTitle.setVisibility(View.VISIBLE);
        tvRedeemableRedeemed.setVisibility(View.VISIBLE);
    }

    public void showNoRewards() {
        tvLifeTimeTitle.setVisibility(View.GONE);
        tvLifeTimeEarned.setVisibility(View.GONE);
        tvRedeemableTitle.setVisibility(View.GONE);
        tvRedeemableEarned.setVisibility(View.GONE);
        tvRedeemedTitle.setVisibility(View.GONE);
        tvRedeemableRedeemed.setVisibility(View.GONE);

        tvLifeTimeEarned.setVisibility(View.VISIBLE);
        tvLifeTimeEarned.setText("You don't have points in this period.");
    }
}
