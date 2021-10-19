package capstone.cs26.iotPlatform.model;

public class QuarterParticipantPointStatistics extends BaseParticipantPointStatistics {
    public QuarterParticipantPointStatistics(Integer year, Integer quarter) {
        this.year = year;
        this.quarter = quarter;
    }

    public Integer year;
    public Integer quarter;
}
