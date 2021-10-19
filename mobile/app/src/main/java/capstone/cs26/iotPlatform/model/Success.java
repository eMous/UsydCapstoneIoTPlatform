package capstone.cs26.iotPlatform.model;

import android.content.Context;
import android.widget.Toast;

public class Success {
    public boolean success;
    public String msg;

    void handle(Context context) {
        if (msg != null && !msg.isEmpty()) {
            if (context != null) {
                Toast.makeText(context, msg, Toast.LENGTH_SHORT).show();
            }
        }
    }
}
