package flow.task.service;

import flow.task.domain.CustomTask;
import flow.task.domain.Task;
import flow.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository repo;

    public TaskService(TaskRepository repo) {
        this.repo = repo;
    }
    /* -----------------------------
                고정 확장자
    ------------------------------ */
    public List<Task> getFixedAll() {
        return repo.selectFixedAll();
    }

    // 체크/해제 DB 저장 (새로고침 유지)
    @Transactional
    public void setFixed(String ext, boolean enabled) {
        String en = ext;

        String yn = enabled ? "Y" : "N";
        int updated = repo.updateFixed(en, yn);
    }
    /* -----------------------------
                커스텀 확장자
    ------------------------------ */
    public List<CustomTask> getCustomAll() {
        return repo.selectCustomAll();
    }
    @Transactional
    public void addCustom(String ext) {
        String normalize = ext;
        List<Task> FixedWord = getFixedAll();
        boolean isFixed = false;

        if (normalize.isEmpty())
            throw new IllegalArgumentException("확장자를 입력하세요.");

        if (normalize.length() > 20)
            throw new IllegalArgumentException("확장자는 최대 20자리입니다.");

        if (repo.countCustomAll() >= 200)
            throw new IllegalStateException("커스텀 확장자는 최대 200개까지 가능합니다.");
        System.out.println(normalize);
        for (int i = 0; i < FixedWord.size(); i++) {
            Task task = FixedWord.get(i);
            String fixed = task.getExt();
            if (fixed.equals(normalize)) {
                isFixed = true;
                break;
            }
        }
        System.out.println("1111111111111111111111"+isFixed);

        if (isFixed) {
            throw new IllegalArgumentException("고정 확장자는 커스텀 확장자로 추가할 수 없습니다.");
        }



        try {
            repo.insertCustom(normalize);
        } catch (Exception e) {
            throw new IllegalArgumentException("이미 등록된 확장자입니다: " + normalize);
        }
    }

    @Transactional
    public void deleteCustom(String ext) {
        String normalize = ext;
        int deleted = repo.deleteCustom(normalize);
    }
}
