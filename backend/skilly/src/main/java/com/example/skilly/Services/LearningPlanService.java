// backend/skilly/src/main/java/com/example.skilly/Services/LearningPlanService.java
package com.example.skilly.Services;

import com.example.skilly.Models.LearningPlan;
import com.example.skilly.Repositories.LearningPlanRepository;
import com.example.skilly.Exceptions.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    public List<LearningPlan> getAllLearningPlans() {
        return learningPlanRepository.findAll();
    }

    public List<LearningPlan> getLearningPlansByUserId(String userId) {
        return learningPlanRepository.findByUserId(userId);
    }

    public List<LearningPlan> getPublicLearningPlans() {
        return learningPlanRepository.findByIsPublicTrue();
    }

    public List<LearningPlan> getSharedLearningPlans(String userId) {
        return learningPlanRepository.findBySharedWithContaining(userId);
    }

    public LearningPlan getLearningPlanById(String id) {
        return learningPlanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learning plan not found with id: " + id));
    }

    public LearningPlan createLearningPlan(LearningPlan learningPlan) {
        // Set creation date and update date
        Date now = new Date();
        learningPlan.setCreatedAt(now);
        learningPlan.setUpdatedAt(now);

        // Generate IDs for topics and resources
        if (learningPlan.getTopics() != null) {
            learningPlan.getTopics().forEach(topic -> {
                topic.setId(UUID.randomUUID().toString());
                if (topic.getResources() != null) {
                    topic.getResources().forEach(resource ->
                            resource.setId(UUID.randomUUID().toString()));
                }
            });
        }

        return learningPlanRepository.save(learningPlan);
    }

    public LearningPlan updateLearningPlan(String id, LearningPlan learningPlanDetails) {
        LearningPlan learningPlan = getLearningPlanById(id);

        learningPlan.setTitle(learningPlanDetails.getTitle());
        learningPlan.setDescription(learningPlanDetails.getDescription());
        learningPlan.setTopics(learningPlanDetails.getTopics());
        learningPlan.setPublic(learningPlanDetails.isPublic());
        learningPlan.setSharedWith(learningPlanDetails.getSharedWith());
        learningPlan.setCompletionDeadline(learningPlanDetails.getCompletionDeadline());
        learningPlan.setUpdatedAt(new Date());

        return learningPlanRepository.save(learningPlan);
    }

    public void deleteLearningPlan(String id) {
        LearningPlan learningPlan = getLearningPlanById(id);
        learningPlanRepository.delete(learningPlan);
    }

    public LearningPlan shareLearningPlan(String id, List<String> userIds) {
        LearningPlan learningPlan = getLearningPlanById(id);
        List<String> sharedWith = learningPlan.getSharedWith();

        if (sharedWith == null) {
            learningPlan.setSharedWith(userIds);
        } else {
            sharedWith.addAll(userIds);
            learningPlan.setSharedWith(sharedWith);
        }

        learningPlan.setUpdatedAt(new Date());
        return learningPlanRepository.save(learningPlan);
    }
}
