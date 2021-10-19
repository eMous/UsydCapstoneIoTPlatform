package capstone.cs26.iotPlatform.model;

public class YearUsed {
    public YearUsed(Integer yearsUsed, Integer earliestYear, Integer latestYear) {
        this.earliestYear = earliestYear;
        this.latestYear = latestYear;
        this.yearsUsed = yearsUsed;
    }

    public Integer earliestYear;
    public Integer latestYear;
    public Integer yearsUsed;
}
