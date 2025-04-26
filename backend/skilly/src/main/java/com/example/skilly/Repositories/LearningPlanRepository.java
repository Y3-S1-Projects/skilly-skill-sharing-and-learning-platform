// backend/skilly/src/main/java/com/example.skilly/Repositories/LearningPlanRepository.java
package com.example.skilly.Repositories;

import com.example.skilly.Models.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByUserId(String userId);
    List<LearningPlan> findByIsPublicTrue();
    List<LearningPlan> findBySharedWithContaining(String userId);
}
