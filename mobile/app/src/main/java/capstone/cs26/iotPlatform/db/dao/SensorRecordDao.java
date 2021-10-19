package capstone.cs26.iotPlatform.db.dao;

import androidx.lifecycle.LiveData;
import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;

import java.util.List;

import capstone.cs26.iotPlatform.model.SensorRecord;

@Dao
public interface SensorRecordDao {
    @Query("SELECT * FROM "+SensorRecord.TABLE_NAME+" WHERE createDetailedTime > :dateTimeMilSec AND participantId " +
            " == :parEmail")
    List<SensorRecord> getRecordsAfterTime(String parEmail, long dateTimeMilSec);

    @Insert
    void insertRecord(SensorRecord sensorRecord);

    @Query("SELECT COUNT(*) FROM " + SensorRecord.TABLE_NAME)
    int getCount();

    @Delete
    void deleteRecord(List<SensorRecord> sensorRecords);
}
