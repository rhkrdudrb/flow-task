package flow.task.controller;

import flow.task.domain.CustomTask;
import flow.task.domain.Task;
import flow.task.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    // 화면 렌더: 새로고침 시 DB 값 유지
    @GetMapping("/")
    public String index(Model model) {
        List<Task> fixedList = service.getFixedAll();
        model.addAttribute("fixedList", fixedList);
        model.addAttribute("customList", service.getCustomAll());
        return "task";
    }

    // 체크/해제 저장 API
    @PostMapping("/api/fixed")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> updateFixed(@RequestBody Map<String, Object> body) {
        String ext = body.get("ext") == null ? "" : String.valueOf(body.get("ext"));

        boolean enabled = body.get("enabled") != null
                && Boolean.parseBoolean(String.valueOf(body.get("enabled")));

        service.setFixed(ext, enabled);

        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        return ResponseEntity.ok(res);
    }

    // 에러 응답 통일(프론트 alert)
    @ExceptionHandler({IllegalArgumentException.class, IllegalStateException.class})
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleBad(RuntimeException ero) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("message", ero.getMessage());
        return ResponseEntity.badRequest().body(res);
    }

    @GetMapping("/api/custom")
    @ResponseBody
    public List<CustomTask> getCustom() {
        return service.getCustomAll();
    }

    @PostMapping("/api/custom")
    @ResponseBody
    public Map<String, Object> addCustom(@RequestBody Map<String, String> body) {
        service.addCustom(body.get("ext"));
        return Map.of("ok", true);
    }

    @DeleteMapping("/api/custom/{ext}")
    @ResponseBody
    public Map<String, Object> deleteCustom(@PathVariable String ext) {
        service.deleteCustom(ext);
        return Map.of("ok", true);
    }

}
