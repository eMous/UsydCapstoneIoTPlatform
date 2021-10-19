package capstone.cs26.iotPlatform.model;

public class MonthParticipantPointStatistics extends BaseParticipantPointStatistics {
    public MonthParticipantPointStatistics(Integer year, Integer month) {
        this.year = year;
        this.month = month;
    }

    public Integer year;
    public Integer month;
}
