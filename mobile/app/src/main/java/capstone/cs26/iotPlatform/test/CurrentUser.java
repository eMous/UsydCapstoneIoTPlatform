package capstone.cs26.iotPlatform.test;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class CurrentUser {

    private final FirebaseUser user = FirebaseAuth.getInstance().getCurrentUser();

    public boolean isLogged() {
        return user != null;
    }

}