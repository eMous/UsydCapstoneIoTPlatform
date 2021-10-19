import axios from "axios";
import routes from "routes";
import { CustomException, ErrorTypes } from "utils/Error";

//Data Preview
export const DataPreview = async (projId, userIdToken) => {
  try {
    const { data, status, statusText } = await axios.post(
      routes.api.dataPreview,
      { projectId: projId },
      {
        headers: {
          Authorization: `Bearer ${userIdToken}`,
        },
      }
    );

    if (status !== 200) {
      throw new CustomException(
        " Data Preview Error",
        `Did not receive a 200 response when retrieving the API: ${statusText}`
      );
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

//Fetch the frequencies
export const FetchFrequencies = async () => {
  try {
    const { data, status, statusText } = await axios.get(
      routes.api.getSensorFrequencies
    );

    if (status !== 200) {
      throw new CustomException(
        " Frequencies Fetch Error",
        `Did not receive a 200 response when retrieving the API: ${statusText}`
      );
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

//Fetch the Api Range
export const FetchApiRange = async () => {
  try {
    const { data, status, statusText } = await axios.get(
      routes.api.getApiRange
    );

    if (status !== 200) {
      throw new CustomException(
        " API Fetch Error",
        `Did not receive a 200 response when retrieving the API: ${statusText}`
      );
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

//Fetch the sensors
export const FetchSensors = async () => {
  try {
    const { data, status, statusText } = await axios.get(routes.api.getSensors);

    if (status !== 200) {
      throw new CustomException(
        " Sensors Fetch Error",
        `Did not receive a 200 response when retrieving the sensors: ${statusText}`
      );
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

//Fetch the gender types
export const FetchGenderTypes = async () => {
  try {
    const { data, status, statusText } = await axios.get(
      routes.api.getGenderTypes
    );

    if (status !== 200) {
      throw new CustomException(
        "Gender Types Fetch Error",
        `Did not receive a 200 response when retrieving the gender types: ${statusText}`
      );
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

// Fetch the Research Field mapping
export const FetchResearchFieldMap = async () => {
  try {
    console.log("inside API call");
    const { data, status, statusText } = await axios.get(
      routes.api.getResearchFieldMap
    );

    if (status !== 200) {
      throw new CustomException(
        "Research Fields Map Error",
        `Did not receive a 200 response when retrieving the research field mapping: ${statusText}`
      );
    }

    return data;
  } catch (error) {
    console.log(error);
  }
};

// Fetch project information
export const FetchProjectInfo = async (projId, idToken) => {
  try {
    const { data, status, statusText } = await axios.post(
      routes.api.findProject,
      {
        projectId: projId,
      },
      {
        headers: {
          Authorization: "Bearer " + idToken,
        },
      }
    );

    if (status !== 200) {
      throw new CustomException(
        "Project Details Error",
        `Did not receive a 200 response when retrieving the project details: ${statusText}`,
        ErrorTypes.FETCH_PROJ_DETAILS
      );
    }

    return data;
  } catch (error) {
    return Promise.reject(error);
  }
};

//login
export const LoginApi = async (idToken) => {
  try {
    const data = await axios.post(
      routes.api.login,
      { idToken },
      {
        headers: {
          Authorization: "Bearer " + idToken,
        },
      }
    );

    if (data.status !== 200) {
      throw new CustomException(
        "login-api error",
        data.data,
        ErrorTypes.LOGIN_API
      );
    }
  } catch (error) {
    console.log(error);
  }
};

//Signout
export const SignOutApi = async (idToken) => {
  try {
    const data = await axios.post(
      routes.api.logout,
      {},
      {
        headers: {
          Authorization: "Bearer " + idToken,
        },
      }
    );

    if (data.code !== 200) {
      throw new CustomException(
        "signout-api error",
        data.errors,
        ErrorTypes.SIGNOUT_API
      );
    }
  } catch (error) {
    console.log(error);
  }
};

//get user's information for profile
export const GetUserInfoApi = async (idToken) => {
  try {
    const data = await axios.get(routes.api.profile, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    });
    if (data.status === 200) {
      console.log("success");
      console.log(data.data);
      return data.data;
    } else if (data.status !== 200) {
      throw new CustomException(
        "profile-api error",
        data.statusText,
        ErrorTypes.BACKEND_PROFILE
      );
    }

    return data.data || null;
  } catch (error) {
    console.log(error);
  }
};

//edit user's profile
export const editProfile = async (profileObj, userIdToken) => {
  let sanitizedProfileObj = {
    organisation: "",
    name: "",
    phoneNum: "",
    researchFields: [],
  };

  if (profileObj.organisation) {
    sanitizedProfileObj.organisation = profileObj.organisation;
  } else {
    delete sanitizedProfileObj.organisation;
  }

  if (profileObj.name) {
    sanitizedProfileObj.name = profileObj.name;
  } else {
    delete sanitizedProfileObj.name;
  }

  if (profileObj.phoneNum) {
    sanitizedProfileObj.phoneNum = profileObj.phoneNum;
  } else {
    delete sanitizedProfileObj.phoneNum;
  }

  if (profileObj.researchFields) {
    sanitizedProfileObj.researchFields = profileObj.researchFields;
  } else {
    delete sanitizedProfileObj.researchFields;
  }

  try {
    if (Object.keys(sanitizedProfileObj).length < 1) {
      throw new Error();
    }
  } catch (error) {
    const errorName = "Server-side Profile Error";
    const custErr = new CustomException(
      errorName,
      "The object provided did not meet the request body requirements.",
      ErrorTypes.BACKEND_PROFILE
    );
    console.log(custErr.toString());
  }

  try {
    await axios.post(routes.api.profile, sanitizedProfileObj, {
      headers: {
        Authorization: `Bearer ${userIdToken}`,
      },
    });
  } catch (error) {
    const errorName = "Server-side Profile Error";
    const custErr = new CustomException(
      errorName,
      "There was an issue editing the user's profile.",
      ErrorTypes.BACKEND_PROFILE
    );
    console.log(custErr.toString());
  }
};

//create a new project
export const CreateAProject = async (projectInfo, userIdToken) => {
  try {
    const data = await axios.post(routes.api.createProject, projectInfo, {
      headers: {
        Authorization: `Bearer ${userIdToken}`,
      },
    });
    if (data.status == 200) {
      return true;
    }

    if (data.status !== 200) {
      throw new CustomException(
        "project-creating-api error",
        data.statusText,
        ErrorTypes.BACKEND_PROJECT
      );
    }

    return data.data || null;
  } catch (error) {
    console.log(error);
  }
};

//update Balance
export const UpdateBalance = async (addedValue, userIdToken) => {
  try {
    console.log(addedValue);
    const data = await axios.post(routes.api.addBalance, addedValue, {
      headers: {
        Authorization: `Bearer ${userIdToken}`,
      },
    });
    if (data.status == 200) {
      return true;
    } else {
      throw new CustomException(
        "project-creating-api error",
        data.statusText,
        ErrorTypes.BACKEND_PROJECT
      );
    }
  } catch (error) {
    const errorName = "Server-side Profile Error";
    const custErr = new CustomException(
      errorName,
      "There was an issue editing the user's balance.",
      ErrorTypes.BACKEND_PROFILE
    );
    console.log(custErr.toString());
  }
};
