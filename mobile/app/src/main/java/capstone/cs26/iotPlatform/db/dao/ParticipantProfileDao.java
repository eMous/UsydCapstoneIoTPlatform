package capstone.cs26.iotPlatform.db.dao;

import android.database.Cursor;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Transaction;
import androidx.room.Update;

import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;

@Dao
public abstract class ParticipantProfileDao {
    @Query("SELECT * FROM " + ParticipantProfile.TABLE_NAME)
    public abstract Cursor getAllParticipant();

    @Query("SELECT * FROM " + ParticipantProfile.TABLE_NAME + " WHERE " + ParticipantProfile.COLUMN_EMAIL + " = :" + ParticipantProfile.COLUMN_EMAIL)
    public abstract LiveData<ParticipantProfile> getParticipantByEmail(String participant_email);
    @Query("SELECT * FROM " + ParticipantProfile.TABLE_NAME + " WHERE " + ParticipantProfile.COLUMN_EMAIL + " = :" + ParticipantProfile.COLUMN_EMAIL)
    public abstract ParticipantProfile getParticipantByEmailNow(String participant_email);



    @Delete
    public abstract void deleteUser(ParticipantProfile participantProfile);

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    protected abstract long insertParticipantProfile(ParticipantProfile participantProfile);

    @Update(onConflict = OnConflictStrategy.IGNORE)
    protected abstract void updateParticipantProfile(ParticipantProfile participantProfile);

    @Transaction
    public void upsert(ParticipantProfile participantProfile) {
        long id = insertParticipantProfile(participantProfile);
        if (id == -1) {
            updateParticipantProfile(participantProfile);
        }
    }
}