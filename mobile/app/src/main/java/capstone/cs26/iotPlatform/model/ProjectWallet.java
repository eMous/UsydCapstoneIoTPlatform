package capstone.cs26.iotPlatform.model;

public class ProjectWallet {
    public String projectId;
    public Boolean exchangeable;
    public Float existingPoints;
    public Float exchangedMoney;
    public Float conversionRate;
    public Float maxExchangeable;

    public String getExpectedFunding() {
        if (!exchangeable || maxExchangeable == null) {
            return "0 AUD";
        } else {
            return maxExchangeable + " AUD";
        }
    }
}
