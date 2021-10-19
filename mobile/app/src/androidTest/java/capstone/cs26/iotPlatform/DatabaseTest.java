package capstone.cs26.iotPlatform;

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class DatabaseTest {
//    private UserDao userDao;
//    private SensorRecordDao sensorRecordDao;
//    private AppDatabase db;
//    private User testUser;
//    private SensorRecord testRecord;
//
//    /**
//     * Initialise a in memory db for testing
//     * Creating a mock user and add that user to the database
//     */
//    @Before
//    public void createDb() {
//        Context context = ApplicationProvider.getApplicationContext();
//        db =  Room.inMemoryDatabaseBuilder(context, AppDatabase.class).build();
////        userDao = db.userDao();
//        sensorRecordDao = db.sensorRecordDao();
//        testUser = new User();
//        testUser.uid = 0;
//        testUser.userName = "222";
//        testUser.detailInfo = new HashMap<String, String>();
////        userDao.insertUser(testUser);
//
//        testRecord = new SensorRecord();
////        testRecord.sensorType = "accelerometer";
////        testRecord.sensorData = new ArrayList<Double>();
//        sensorRecordDao.insertRecord(testRecord);
//    }
//
//    /**
//     * Test the actually way of get an instance of the DB works
//     */
//    @Test
//    public void testCreateWithGetInstance(){
//        Context context = ApplicationProvider.getApplicationContext();
//        AppDatabase appDatabase = AppDatabase.getInstance(context);
////        appDatabase.userDao().getAllUser();
//    }
//
//    @Test
//    public void testInsert(){
//        User user = new User();
//        user.uid=1;
////        userDao.insertUser(user);
//        // TODO : update to mongoDB
//    }

//    @Test
//    public void testGetAll(){
////        List<User> users = userDao.getAllUser();
////        assertEquals(users.size(), 1);
//    }
//
//    @Test
//    public void testGetUser(){
////        List<User> users = userDao.getUser(testUser.uid);
//        // should only return 1 user which match the same uid and userName
////        for (User user : users) {
////            assertEquals(testUser.uid,user.uid);
////            assertEquals(testUser.userName, user.userName);
////        }
//    }
//    @Test
//    public void testUpdateUserName(){
////        User user = userDao.getUser(testUser.uid).get(0);
////        user.userName = "somethingElse";
////        userDao.updateUser(user);
////        User updatedUser = userDao.getUser(testUser.uid).get(0);
////        assertEquals(user.userName, updatedUser.userName);
//    }
//
//    @Test(expected= SQLiteConstraintException.class)
//    public void testConflictUid(){
////        User user = new User();
////        user.uid = testUser.uid;
////        userDao.insertUser(user);
//    }
//
//    @Test
//    public void testDeleteUser(){
////        User user = new User();
////        user.uid = 33;
////        userDao.insertUser(user);
////        int numUser = userDao.getAllUser().size();
////        userDao.deleteUser(user);
////        int numUserUpdated = userDao.getAllUser().size();
////        assertEquals(numUser-1, numUserUpdated);
//    }
//
//    @Test
//    public void testGetSensorRecord(){
////        SensorRecord record = sensorRecordDao.getAllRecords().get(0);
////        System.out.println("SensorInfo: " + record.sensorType+ "\t"+ record.time_recorded);
//    }
//
//    @After
//    public void closeDb(){
//        db.close();
//    }
}
