package capstone.cs26.iotPlatform;

public class RegisterActivityTest {

//        // Added by Manisha
//
//        /**
//         * For the Register Activity the input is not valid if
//         *      1. The Name/Email/Password is empty
//         *      2. The Gender is 'select' ( or is empty) as Gender is a dropdown
//         *      3. The email is already Taken or exists
//         *      4. ConfirmPassword does not match Password
//         *      5. Length of Password is less than 6 alphanumeric characters
//         */
//
//        private RegisterActivity RegisterActivityTest;
//
//        @Before
//        public void setUp() throws Exception {
//            RegisterActivityTest = new RegisterActivity();
//        }
//
//    @Test
//    public void testOnCreate() {
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_name));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_email));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_password));
//        assertNull(RegisterActivityTest.findViewById(R.id.edit_password_again));
//        assertNull(RegisterActivityTest.findViewById(R.id.spinner_gender));
//        assertNull(RegisterActivityTest.findViewById(R.id.btn_register));
//    }
//
//        //Testcase for Name field
//        @Test
//        public void isNameValid1() {
//            assertEquals(RegisterActivityTest.isNameValid(""), false);
//        }
//        @Test
//        public void isNameValid2() {
//            assertEquals(RegisterActivityTest.isNameValid("Capstone Project"), false);
//        }
//        @Test
//        public void isNameValid3() {
//            assertEquals(RegisterActivityTest.isNameValid("Capstone Prj"), true);
//        }
//        @Test
//        public void isNameValid4() {
//            assertEquals(RegisterActivityTest.isNameValid("Capstone"), true);
//        }
//
//        //Testcase for Email field
//        @Test
//        public void isEmailValid1() {
//            assertEquals(RegisterActivityTest.isEmailValid(""), false);
//        }
//        @Test
//        public void isEmailValid2() {
//            assertEquals(RegisterActivityTest.isEmailValid("ababababab@gmail.com"), true);
//        }
//
//        @Test
//        public void isEmailValid3() {
//            assertEquals(RegisterActivityTest.isEmailValid("fdsagag"), false);
//        }
//
//        // Testcases for Password field
//        @Test
//        public void isPasswordValid1() {
//            assertEquals(RegisterActivityTest.isPasswordValid(""),false);
//        }
//        @Test
//        public void isPasswordValid2() {
//            assertEquals(RegisterActivityTest.isPasswordValid("1234"), false);
//        }
//        @Test
//        public void isPasswordValid3() {
//            assertEquals(RegisterActivityTest.isPasswordValid("123456"),true);
//        }
//
//        @Test
//        public void checkPasswordMatch1() {
//            assertEquals(RegisterActivityTest.checkPasswordMatch("12345678", "12345678"), true);
//        }
//
//        @Test
//        public void checkPasswordMatch2() {
//            assertEquals(RegisterActivityTest.checkPasswordMatch("12345678", "123678"), false);
//        }
}
// Code added by Manisha ends
