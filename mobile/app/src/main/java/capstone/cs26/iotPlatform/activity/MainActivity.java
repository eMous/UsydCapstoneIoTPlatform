package capstone.cs26.iotPlatform.activity;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.VisibleForTesting;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.core.view.GravityCompat;
import androidx.core.widget.ContentLoadingProgressBar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.fragment.app.FragmentManager;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.Observer;
import androidx.navigation.NavController;
import androidx.navigation.NavDestination;
import androidx.navigation.Navigation;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import androidx.test.espresso.idling.net.UriIdlingResource;

import com.google.android.material.navigation.NavigationView;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.gson.Gson;

import org.jetbrains.annotations.NotNull;

import capstone.cs26.iotPlatform.R;
import capstone.cs26.iotPlatform.model.GetFrequencyRequestModel;
import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.PostProfileGPSRequestModel;
import capstone.cs26.iotPlatform.service.sensor.MasterService;
import capstone.cs26.iotPlatform.util.CachedModels;
import capstone.cs26.iotPlatform.util.Conf;
import capstone.cs26.iotPlatform.util.IRender;
import capstone.cs26.iotPlatform.util.ServiceUtils;
import capstone.cs26.iotPlatform.util.Util;
import pub.devrel.easypermissions.AfterPermissionGranted;
import pub.devrel.easypermissions.EasyPermissions;

public class MainActivity extends AppCompatActivity implements SwipeRefreshLayout.OnRefreshListener, LocationListener
        , IRender {
    final static String TAG = "MainActivity";
    // For testing usage
    static volatile UriIdlingResource idlingResource;
    public CachedModels cachedModels;
    LocationManager locationManager;

    public SwipeRefreshLayout mSwipeRefreshLayout;
    public AppBarConfiguration mAppBarConfiguration;
    public FragmentManager fragmentManager;
    public ImageView ivNotificationBell;
    public TextView tvFragmentTitle;
    public NavController navController;


    // --------------------------- UI Stuff Begin ---------------------------
    TextView tvNameNavHeader;
    TextView tvEmailNavHeader;
    NavigationView navigationView;
    ContentLoadingProgressBar progressBar;
    Observer<ParticipantNotifications> parNotObserver;
    LiveData<ParticipantNotifications> parNotLiveData;
    Observer<ParticipantProfile> parObserver;
    LiveData<ParticipantProfile> parLiveData;

    Observer<Boolean> loginObserver;
    ParticipantProfile profile;
    Boolean bLogin;

    static double lon;
    static double lat;

    @VisibleForTesting
    @NonNull
    public static UriIdlingResource getIdlingResource() {
        if (idlingResource == null) {
            idlingResource = new UriIdlingResource("idlingResource", 1500);
        }
        return idlingResource;
    }

    public static void loadUriForIdlingResource(Object obj) {
        if (obj == null) return;
        String uri = new Gson().toJson(obj);
        if (idlingResource == null) return;
        idlingResource.beginLoad(uri);
    }

    public static void endLoadForIdlingResource(Object obj) {
        if (obj == null) return;
        String uri = new Gson().toJson(obj);
        if (idlingResource == null) return;
        idlingResource.endLoad(uri);
    }

    private void initUI() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        mAppBarConfiguration = new AppBarConfiguration.Builder(
                R.id.new_nav_dashboard, R.id.new_nav_profile, R.id.new_nav_notifications, R.id.new_nav_rewards,
                R.id.new_nav_settings,
                R.id.new_nav_help, R.id.new_nav_proj_list)
                .setDrawerLayout(drawer)
                .build();
        navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        NavigationUI.setupActionBarWithNavController(this, navController, mAppBarConfiguration);
        NavigationUI.setupWithNavController(navigationView, navController);
        navigationView.setNavigationItemSelectedListener(new NavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                // For safe, we don't allow to instance of fragment
                while (navController.popBackStack()) {
                }
                navController.navigate(item.getItemId());
                DrawerLayout drawer = findViewById(R.id.drawer_layout);
                drawer.close();
                return true;
            }
        });
        fragmentManager = getSupportFragmentManager().findFragmentById(R.id.nav_host_fragment).getChildFragmentManager();
        setFragmentTitle("");

        tvNameNavHeader = navigationView.getHeaderView(0).findViewById(R.id.textViewName);
        tvEmailNavHeader = navigationView.getHeaderView(0).findViewById(R.id.textViewEmail);

        tvFragmentTitle = toolbar.findViewById(R.id.pageTitle);
        ivNotificationBell = toolbar.findViewById(R.id.notificationButton);
        ivNotificationBell.setOnClickListener(v -> {
            while (navController.popBackStack()) {
            }
            navController.navigate(R.id.new_nav_notifications);
        });

        progressBar = findViewById(R.id.progressBar);

        // SwipeRefreshLayout
        mSwipeRefreshLayout = findViewById(R.id.swipe_container);
        mSwipeRefreshLayout.setOnRefreshListener(this);
        mSwipeRefreshLayout.setColorSchemeResources(R.color.colorPrimary,
                android.R.color.holo_green_dark,
                android.R.color.holo_orange_dark,
                android.R.color.holo_blue_dark);
    }

    public void setFragmentTitle(String title) {
        if (tvFragmentTitle != null) {
            tvFragmentTitle.setText(title);
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_options, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int k = item.getItemId();
        // Handle item selection
        switch (item.getItemId()) {
            case R.id.menu_item_logout:
                menuLogoutClicked(0);
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    void menuLogoutClicked(int times) {
        if (times > 10) {
            FirebaseAuth.getInstance().signOut();
            Log.d(TAG, "Sign out forcibly");
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }
        Log.e(TAG, "Check hasLoginToServer, want to log out");
        if (MasterService.getInstance().hasLoginToServer()) {
            FirebaseAuth.getInstance().signOut();
            Log.d(TAG, "Successfully sign out");
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        } else {
            final int newTime = times + 1;
            new Handler(getMainLooper()).postDelayed(() -> {
                menuLogoutClicked(newTime);
            }, 200);
        }
    }

    @SuppressLint("RestrictedApi")
    @Override
    public void onBackPressed() {
        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
            return;
        }


        NavDestination currentDes = navController.getCurrentDestination();
        boolean upSuc = navController.popBackStack();
        if (!upSuc) {
            navController.navigate(currentDes.getId());
            Toast.makeText(this, "Show a warning to exit", Toast.LENGTH_SHORT);
        }
//        super.onBackPressed();
        return;
    }

    @Override
    public boolean onSupportNavigateUp() {
        NavController navController = Navigation.findNavController(this, R.id.nav_host_fragment);
        return NavigationUI.navigateUp(navController, mAppBarConfiguration)
                || super.onSupportNavigateUp();
    }
    // --------------------------- UI Stuff End ---------------------------

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FirebaseApp.initializeApp(this);
        if (FirebaseAuth.getInstance().getCurrentUser() == null) {
            // When user logout and click notification
            finish();
        }
        cachedModels = new CachedModels(this, this, this);
        setContentView(R.layout.activity_main);
        initUI();
        getFrequency();
        initObserver();
        registerBroadcastReceiver();
        handleIntent(getIntent());

        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        requestPermission(this, "Please grant the location permission", MY_PERMISSIONS_REQUEST_FINE_LOCATION,
                new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, this::afterFineLocationGranted);
    }

    @Override
    public void render(CachedModels cachedModels) {
        if (cachedModels.profile != null) profile = cachedModels.profile;
        checkProgressBar();
        if (profile != null) {
            tvNameNavHeader.setText(profile.name);
            tvEmailNavHeader.setText(profile.email);
        }
        ParticipantNotifications participantNotifications = cachedModels.parNot;
        if (participantNotifications != null) {
            if (participantNotifications.unhandledInvitations == null || participantNotifications.unhandledInvitations.size() == 0) {
                ivNotificationBell.setImageResource(R.drawable.no_notification_bell);
            } else {
                ivNotificationBell.setImageResource(R.drawable.notification_bell);
            }
        }
    }

    private void getFrequency() {
        new GetFrequencyRequestModel().request(this);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NotNull String[] permissions, @NotNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);

        // Forward results to EasyPermissions
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);


    }


    @SuppressLint("MissingPermission")
    @AfterPermissionGranted(MY_PERMISSIONS_REQUEST_FINE_LOCATION)
    void afterFineLocationGranted() {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
//            requestPermission(this, "Please grant the background location permission",
//                    MY_PERMISSIONS_REQUEST_BACKGROUND_LOCATION,
//                    new String[]{Manifest.permission.ACCESS_BACKGROUND_LOCATION}, null);
//        }
        locationManager.requestLocationUpdates(
                locationManager.getBestProvider(new Criteria(), true),
                Conf.INTERVAL_TO_UPDATE_LOCATION,
                Conf.DISTANCE_TO_UPDATE_LOCATION, this);
    }

    void requestPermission(Activity activity, String rationale, int permissionRequestCode, String[] perms, Runnable r) {
        if (EasyPermissions.hasPermissions(this, perms)) {
            if (r != null) {
                r.run();
            }
        } else {
            EasyPermissions.requestPermissions(activity, rationale, permissionRequestCode, perms);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        String command = intent.getStringExtra("command");
        if (command != null) {
            if (command.equals("invitation")) {
                Bundle bundle = new Bundle();
                bundle.putString("prjId", intent.getStringExtra("prjId"));
                bundle.putBoolean("isIn", false);
                navController.popBackStack();
                navController.navigate(R.id.new_nav_notifications);
                navController.navigate(R.id.projectDetailsFragment, bundle);
            } else if (command.equals("retrieveData")) {
                navController.popBackStack();
                navController.navigate(R.id.new_nav_notifications);
            }
        }
    }

    private void initObserver() {
        loginObserver = this::onLoginChanged;
    }

    private void onLoginChanged(Boolean bLogin) {
        this.bLogin = bLogin;
        checkProgressBar();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        locationManager.removeUpdates(this);
    }

    private void registerBroadcastReceiver() {
        Log.e(TAG, "registerBroadcastReceiver");
        BroadcastReceiver serviceReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                switch (intent.getAction()) {
                    case Conf.BROADCAST_FILTER_BACK_TO_LOGIN:
                        String reason = intent.getStringExtra(Conf.MESSAGE_BACK_TO_LOGIN_MESSAGE_KEY);
                        MainActivity.this.finish();
                        FirebaseAuth.getInstance().signOut();
                        Intent intentToStart = new Intent(MainActivity.this, LoginActivity.class);
                        intentToStart.putExtra(Conf.INTENT_EXTRA_MSG_TO_SHOW, reason);
                        startActivity(intentToStart);
                    default:
                        break;
                }
                return;
            }
        };
        IntentFilter filter = new IntentFilter();
        filter.addAction(Conf.BROADCAST_FILTER_BACK_TO_LOGIN);
        registerReceiver(serviceReceiver, filter);
    }

    void onParChanged(ParticipantProfile profile) {

    }

    @Override
    protected void onResume() {
        super.onResume();
        ServiceUtils.serviceCheck(this);
        MasterService.mHasLoginToServerLiveData.observe(this, loginObserver);
    }

    @Override
    protected void onPause() {
        super.onPause();
        MasterService.mHasLoginToServerLiveData.removeObserver(loginObserver);
    }

    void checkProgressBar() {
        if (profile == null || bLogin == null || !bLogin) {
            waitProgress();
        } else {
            doneProgress();
        }
    }

    public void waitProgress() {
        progressBar.setVisibility(View.VISIBLE);
    }

    public void doneProgress() {
        progressBar.setVisibility(View.INVISIBLE);
    }

    @Override
    public void onRefresh() {
        Util.forceRefreshAll(this);
        mSwipeRefreshLayout.setRefreshing(false);
        mSwipeRefreshLayout.setEnabled(false);
        new Handler(getMainLooper()).postDelayed(() -> {
            mSwipeRefreshLayout.setEnabled(true);
        }, 15000);
    }

    public void enableSwipeRefresh(boolean flag) {
        if (mSwipeRefreshLayout != null) {
            mSwipeRefreshLayout.setEnabled(flag);
        }
    }

    public static final int MY_PERMISSIONS_REQUEST_FINE_LOCATION = 99;
    public static final int MY_PERMISSIONS_REQUEST_BACKGROUND_LOCATION = 98;

    @Override
    public void onLocationChanged(@NonNull Location location) {
        lat = location.getLatitude();
        lon = location.getLongitude();

        sendLocation(lat, lon);
    }

    public void sendLocation(double lat, double lon) {
        MasterService service = MasterService.getInstance();
        FirebaseUser firebaseUser = FirebaseAuth.getInstance().getCurrentUser();
        if (service != null && firebaseUser != null) {
            if (service.hasLoginToServer()) {
                PostProfileGPSRequestModel postProfileGPSRequestModel = new PostProfileGPSRequestModel(lat, lon);
                postProfileGPSRequestModel.request(this);
            } else {
                new Handler().postDelayed(() -> sendLocation(lat, lon), 5000);
            }
        }
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {

    }

    @Override
    public void onProviderEnabled(@NonNull String provider) {

    }

    @Override
    public void onProviderDisabled(@NonNull String provider) {

    }
}
