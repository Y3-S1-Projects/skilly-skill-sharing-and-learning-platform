
package com.example.skilly.Controllers;

import com.example.skilly.Models.LearningPlan;
import com.example.skilly.Services.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {

    @Autowired
    private LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<List<LearningPlan>> getAllLearningPlans() {
        return ResponseEntity.ok(learningPlanService.getAllLearningPlans());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<LearningPlan>> getLearningPlansByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(learningPlanService.getLearningPlansByUserId(userId));
    }

    @GetMapping("/public")
    public ResponseEntity<List<LearningPlan>> getPublicLearningPlans() {
        return ResponseEntity.ok(learningPlanService.getPublicLearningPlans());
    }

    @GetMapping("/shared/{userId}")
    public ResponseEntity<List<LearningPlan>> getSharedLearningPlans(@PathVariable String userId) {
        return ResponseEntity.ok(learningPlanService.getSharedLearningPlans(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getLearningPlanById(@PathVariable String id) {
        return ResponseEntity.ok(learningPlanService.getLearningPlanById(id));
    }

    @PostMapping
    public ResponseEntity<LearningPlan> createLearningPlan(@RequestBody LearningPlan learningPlan) {
        return new ResponseEntity<>(learningPlanService.createLearningPlan(learningPlan), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updateLearningPlan(
            @PathVariable String id,
            @RequestBody LearningPlan learningPlanDetails) {
        return ResponseEntity.ok(learningPlanService.updateLearningPlan(id, learningPlanDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLearningPlan(@PathVariable String id) {
        learningPlanService.deleteLearningPlan(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<LearningPlan> shareLearningPlan(
            @PathVariable String id,
            @RequestBody List<String> userIds) {
        return ResponseEntity.ok(learningPlanService.shareLearningPlan(id, userIds));
    }
}
