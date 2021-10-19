export class CustomException extends Error {
  constructor(name, msg, type = null) {
    super(msg);
    this.name = name;
    this.type = type;
  }
}

export const ErrorTypes = {
  REGISTER_NAME: "reg_name",
  REGISTER_ORG: "reg_org",
  REGISTER_EMAIL: "reg_email",
  REGISTER_PWD: "reg_pwd",
  BACKEND_LOGIN: "backend_login",
  BACKEND_LOGOUT: "backend_logout",
  BIND_PROFILE: "bind-profile-info",
  BACKEND_PROFILE: "backend_profile",
  LOGIN_EMAIL: "login_email",
  LOGIN_PWD: "login_pwd",
  LOGIN_ID_TOKEN: "firebase_login_token",
  FETCH_PROJ_DETAILS: "fetch_project_details",
  FETCH_GENDER_TYPES: "fetch_gender_types",
  FETCH_RESEARCH_FIELDS: "fetch_research_fields",
  FETCH_SENSORS: "fetch_sensors",
  CREAT_PROJECT: "creat_project",
  FETCH_API: "fetch_api",
};
