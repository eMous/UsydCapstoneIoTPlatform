package capstone.cs26.iotPlatform.db.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Transaction;
import androidx.room.Update;

import java.util.HashMap;

import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;

@Dao
public abstract class ParticipantNotificationsDao {

    @Query("SELECT * FROM " + ParticipantNotifications.TABLE_NAME + " WHERE " + ParticipantNotifications.COLUMN_PK + " = :" + ParticipantNotifications.COLUMN_PK)
    public abstract LiveData<ParticipantNotifications> getParticipantNotificationsByEmail(String participantId);

    @Query("SELECT * FROM " + ParticipantNotifications.TABLE_NAME + " WHERE " + ParticipantNotifications.COLUMN_PK + " = :" + ParticipantNotifications.COLUMN_PK)
    public abstract ParticipantNotifications getParticipantNotificationsByEmailNow(String participantId);

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    public abstract long insertParticipantNotifications(ParticipantNotifications participantNotifications);

    @Update(onConflict = OnConflictStrategy.IGNORE)
    public abstract void updateParticipantNotifications(ParticipantNotifications participantNotifications);

    @Transaction
    public void upsert(ParticipantNotifications parNoToUpdate) {
        long id = insertParticipantNotifications(parNoToUpdate);
        if (id == -1) {
            ParticipantNotifications exist =
                    getParticipantNotificationsByEmailNow(parNoToUpdate.participantId);
            if (exist == null) {
                // TODO: I don't know why it is null as well
                return;
            }
            if (exist.prjDetails != null){
                parNoToUpdate.prjDetails = exist.prjDetails;
            }
            updateParticipantNotifications(parNoToUpdate);
        }
    }

    @Transaction
    public void upsertPrjDetails(String prjId, String prjTitle, String prjDescription, String parEmail){
        ParticipantNotifications parNo = getParticipantNotificationsByEmailNow(parEmail);
        HashMap<String,String> detailOfPrj = new HashMap<>();
        detailOfPrj.put("prjTitle",prjTitle);
        detailOfPrj.put("prjDescription",prjDescription);
        if (parNo == null){
            ParticipantNotifications parNoToInsert = new ParticipantNotifications();
            parNoToInsert.participantId = parEmail;
            parNoToInsert.prjDetails = new HashMap<String,HashMap<String, String>>();
            parNoToInsert.prjDetails.put(prjId,detailOfPrj);
            insertParticipantNotifications(parNoToInsert);
        }else{
            if (parNo.prjDetails == null){
                parNo.prjDetails = new HashMap<String,HashMap<String, String>>();
            }
            parNo.prjDetails.put(prjId,detailOfPrj);
            updateParticipantNotifications(parNo);
        }
    }
}