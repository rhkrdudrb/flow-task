package flow.task.repository;

import flow.task.domain.CustomTask;
import flow.task.domain.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TaskRepository {
    /* -----------------------------
             고정 확장자
     ------------------------------ */
    List<Task> selectFixedAll();

    int updateFixed(@Param("ext") String ext, @Param("enabled") String enabled);

    /* -----------------------------
                커스텀 확장자
    ------------------------------ */
    List<CustomTask> selectCustomAll();

    int countCustomAll();

    int insertCustom(@Param("ext") String ext);

    int deleteCustom(@Param("ext") String ext);
}