const apiServerDomain = " http://34.151.82.81";
// const apiServerDomain = "http://ss.caihuashuai.com:3001";

const routes = {
  register: {
    title: "Register",
    url: "/register",
  },
  forgotPwd: {
    title: "Forgot Password",
    url: "/forgot-pwd",
  },
  authenticated: {
    title: "Home",
    url: "/home",
  },
  dashboard: {
    title: "Dashboard",
    url: "/dashboard",
  },
  login: {
    title: "Login",
    url: "/login",
  },
  profile: {
    title: "Profile",
    url: "/profile",
  },
  projects: {
    title: "Manage Projects",
    url: "/projects",
  },
  projectDetails: {
    title: "Review Project Details",
    url: "/project/details",
  },
  createProject: {
    title: "Create a new Project",
    url: "/createproject",
  },
  balance: {
    title: "Balance",
    url: "/balance",
  },
  api: {
    login: apiServerDomain + "/api/projectowner/auth/login",
    logout: apiServerDomain + "/api/projectowner/auth/logout",
    profile: apiServerDomain + "/api/projectowner/profile",
    createProject: apiServerDomain + "/api/projectowner/project/",
    findProject: apiServerDomain + "/api/projectowner/project/projDetails",
    getResearchFieldMap:
      apiServerDomain + "/api/projectowner/publicResources/researchFields",
    getGenderTypes:
      apiServerDomain + "/api/projectowner/publicResources/genderTypes",
    getSensors:
      apiServerDomain + "/api/projectowner/publicResources/sensorNames",
    getApiRange:
      apiServerDomain + "/api/projectowner/publicResources/apiLevels",
    addBalance: apiServerDomain + "/api/projectowner/profile/addBalance",
    getSensorFrequencies:
      apiServerDomain + "/api/projectowner/publicResources/sensorFrequencies",
    dataPreview: apiServerDomain + "/api/projectowner/project/filter",
    datadownload:
      apiServerDomain + "/api/projectowner/project/records?projectId=",
  },
};

export default routes;
