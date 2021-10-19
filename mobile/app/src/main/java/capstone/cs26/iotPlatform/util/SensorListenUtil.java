package capstone.cs26.iotPlatform.util;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;

import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;

public class SensorListenUtil {
    public static ArrayList<String> getNeedToContributeProjects(ParticipantProfile participantProfile,
                                                                HashMap<String, Project> projects) {
        ArrayList<String> prjs = new ArrayList<>();
        if (participantProfile == null) return prjs;

        for (int i = 0; i < participantProfile.projects.size(); ++i) {
            ParticipantProfile.ProjectInParticipantProfile prjInPar = participantProfile.projects.get(i);
            if (prjInPar.joinTime == null) continue;
            if (prjInPar.leaveTime != null) continue;
            if (prjInPar.prjStartTime.getTime() > new Date().getTime()) continue;
            if (prjInPar.prjComplete) continue;
            if (!prjInPar.iCanContribute(participantProfile, projects.get(prjInPar.projectId))) continue;
            prjs.add(prjInPar.projectId);
        }
        return prjs;
    }
}
