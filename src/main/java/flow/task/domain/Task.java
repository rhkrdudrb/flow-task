package flow.task.domain;

public class Task {
    private String ext;
    private String enabled; // 'Y' or 'N'

    public Task() {}

    public String getExt() { return ext; }
    public String getEnabled() { return enabled; }

    public void setExt(String ext) { this.ext = ext; }
    public void setEnabled(String enabled) { this.enabled = enabled; }

}