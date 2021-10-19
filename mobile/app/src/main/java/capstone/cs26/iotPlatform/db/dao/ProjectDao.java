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

import java.util.ArrayList;

import capstone.cs26.iotPlatform.model.ParticipantNotifications;
import capstone.cs26.iotPlatform.model.ParticipantProfile;
import capstone.cs26.iotPlatform.model.Project;

@Dao
public abstract class ProjectDao {
    @Query("SELECT * FROM " + Project.TABLE_NAME + " WHERE " + Project.COLUMN_PK + " = :" + Project.COLUMN_PK)
    public abstract LiveData<Project> getProjectByProjectId(String projectId);

    @Query("SELECT * FROM " + Project.TABLE_NAME + " WHERE " + Project.COLUMN_PK + " = :" + Project.COLUMN_PK)
    public abstract Project getProjectByProjectIdNow(String projectId);

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    public abstract long insertProject(Project project);

    @Update(onConflict = OnConflictStrategy.IGNORE)
    public abstract void updateProject(Project project);

    @Transaction
    public void upsert(Project project) {
        long id = insertProject(project);
        if (id == -1) {
            updateProject(project);
        }
    }


}