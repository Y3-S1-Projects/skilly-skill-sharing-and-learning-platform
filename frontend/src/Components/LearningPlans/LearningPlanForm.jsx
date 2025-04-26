import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const LearningPlanForm = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
    completionDeadline: "",
    topics: []
  });

  useEffect(() => {
    if (plan) {
      // Format date for input field
      const deadline = plan.completionDeadline
        ? new Date(plan.completionDeadline).toISOString().split('T')[0]
        : "";

      setFormData({
        ...plan,
        completionDeadline: deadline
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleAddTopic = () => {
    setFormData({
      ...formData,
      topics: [
        ...formData.topics,
        {
          id: uuidv4(),
          name: "",
          description: "",
          resources: [],
          completed: false
        }
      ]
    });
  };

  const handleRemoveTopic = (topicId) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter(topic => topic.id !== topicId)
    });
  };

  const handleTopicChange = (topicId, field, value) => {
    setFormData({
      ...formData,
      topics: formData.topics.map(topic =>
        topic.id === topicId ? { ...topic, [field]: value } : topic
      )
    });
  };

  const handleAddResource = (topicId) => {
    setFormData({
      ...formData,
      topics: formData.topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: [
              ...topic.resources,
              {
                id: uuidv4(),
                title: "",
                type: "article",
                url: "",
                completed: false
              }
            ]
          };
        }
        return topic;
      })
    });
  };

  const handleRemoveResource = (topicId, resourceId) => {
    setFormData({
      ...formData,
      topics: formData.topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.filter(resource => resource.id !== resourceId)
          };
        }
        return topic;
      })
    });
  };

  const handleResourceChange = (topicId, resourceId, field, value) => {
    setFormData({
      ...formData,
      topics: formData.topics.map(topic => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.map(resource =>
              resource.id === resourceId ? { ...resource, [field]: value } : resource
            )
          };
        }
        return topic;
      })
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Format date for API
    const formattedData = {
      ...formData,
      completionDeadline: formData.completionDeadline
        ? new Date(formData.completionDeadline)
        : null
    };

    onSubmit(formattedData);
  };

  // Styles
  const styles = {
    form: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "2rem",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    },
    formHeader: {
      textAlign: "center",
      marginBottom: "2rem",
      paddingBottom: "1.5rem",
      borderBottom: "1px solid #f0f0f0"
    },
    formTitle: {
      color: "#4f46e5",
      fontSize: "1.75rem",
      marginBottom: "0.5rem",
      fontWeight: "700"
    },
    formSubtitle: {
      color: "#6b7280",
      fontSize: "1rem"
    },
    formSection: {
      marginBottom: "1.5rem"
    },
    label: {
      display: "block",
      fontWeight: "500",
      color: "#374151",
      fontSize: "0.95rem",
      marginBottom: "0.5rem"
    },
    requiredStar: {
      color: "#ef4444",
      marginLeft: "2px"
    },
    input: {
      display: "block",
      width: "100%",
      padding: "0.75rem 1rem",
      marginTop: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
      fontSize: "0.95rem",
      transition: "all 0.2s ease"
    },
    textarea: {
      display: "block",
      width: "100%",
      padding: "0.75rem 1rem",
      marginTop: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
      fontSize: "0.95rem",
      resize: "vertical",
      minHeight: "100px"
    },
    checkbox: {
      width: "18px",
      height: "18px",
      marginRight: "10px",
      accentColor: "#4f46e5"
    },
    checkboxContainer: {
      display: "flex",
      alignItems: "center",
      marginBottom: "1.5rem"
    },
    checkboxLabel: {
      fontSize: "0.95rem",
      color: "#374151"
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.25rem"
    },
    sectionTitle: {
      fontSize: "1.25rem",
      fontWeight: "600",
      color: "#111827",
      margin: "0"
    },
    subsectionTitle: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#4b5563",
      margin: "0"
    },
    addButton: {
      backgroundColor: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0.5rem 1rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    },
    addResourceButton: {
      backgroundColor: "#6366f1",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0.4rem 0.75rem",
      fontSize: "0.8rem",
      fontWeight: "500",
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    },
    topicsSection: {
      marginTop: "2rem"
    },
    emptyState: {
      textAlign: "center",
      padding: "2rem",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      border: "1px dashed #d1d5db",
      color: "#6b7280",
      marginBottom: "1.5rem"
    },
    topicCard: {
      border: "1px solid #e5e7eb",
      borderRadius: "10px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      backgroundColor: "#f9fafb",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.05)"
    },
    topicHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1.25rem",
      paddingBottom: "0.75rem",
      borderBottom: "1px solid #e5e7eb"
    },
    topicTitle: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "#111827",
      margin: "0"
    },
    removeButton: {
      backgroundColor: "transparent",
      color: "#ef4444",
      border: "1px solid #ef4444",
      borderRadius: "6px",
      padding: "0.4rem 0.75rem",
      fontSize: "0.8rem",
      cursor: "pointer"
    },
    resourcesSection: {
      marginTop: "1.5rem",
      paddingTop: "1rem",
      borderTop: "1px dashed #e5e7eb"
    },
    resourceCard: {
      backgroundColor: "white",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "1rem",
      marginBottom: "1rem"
    },
    resourceHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "1rem"
    },
    resourceTitle: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#4b5563",
      margin: "0"
    },
    resourceGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem"
    },
    resourceField: {
      marginBottom: "0.75rem"
    },
    fullWidth: {
      gridColumn: "span 2"
    },
    select: {
      display: "block",
      width: "100%",
      padding: "0.75rem 1rem",
      marginTop: "0.5rem",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      backgroundColor: "#f9fafb",
      fontSize: "0.95rem",
      appearance: "none",
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "16px 12px",
      paddingRight: "2.5rem"
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "1rem",
      marginTop: "2rem",
      paddingTop: "1.5rem",
      borderTop: "1px solid #f0f0f0"
    },
    cancelButton: {
      backgroundColor: "white",
      color: "#4b5563",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      padding: "0.75rem 1.5rem",
      fontSize: "0.95rem",
      fontWeight: "500",
      cursor: "pointer"
    },
    submitButton: {
      backgroundColor: "#4f46e5",
      color: "white",
      border: "none",
      borderRadius: "6px",
      padding: "0.75rem 1.5rem",
      fontSize: "0.95rem",
      fontWeight: "500",
      cursor: "pointer",
      boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)"
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formHeader}>
        <h2 style={styles.formTitle}>{plan ? "Update" : "Create"} Your Learning Journey</h2>
        <p style={styles.formSubtitle}>Design a structured path to achieve your learning goals</p>
      </div>

      <div style={styles.formSection}>
        <label htmlFor="title" style={styles.label}>
          <span>Title</span>
          <span style={styles.requiredStar}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Mastering React Development"
          style={styles.input}
        />
      </div>

      <div style={styles.formSection}>
        <label htmlFor="description" style={styles.label}>
          <span>Description</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your learning goals and what you hope to achieve..."
          style={styles.textarea}
        ></textarea>
      </div>

      <div style={styles.checkboxContainer}>
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          style={styles.checkbox}
        />
        <label htmlFor="isPublic" style={styles.checkboxLabel}>
          Make this learning plan public
        </label>
      </div>

      <div style={styles.formSection}>
        <label htmlFor="completionDeadline" style={styles.label}>
          <span>Completion Deadline</span>
        </label>
        <input
          type="date"
          id="completionDeadline"
          name="completionDeadline"
          value={formData.completionDeadline}
          onChange={handleChange}
          style={styles.input}
        />
      </div>

      <div style={styles.topicsSection}>
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Topics</h3>
          <button
            type="button"
            onClick={handleAddTopic}
            style={styles.addButton}
          >
            <span style={{ marginRight: "4px" }}>+</span> Add Topic
          </button>
        </div>

        {formData.topics.length === 0 && (
          <div style={styles.emptyState}>
            <p>No topics added yet. Add your first learning topic to get started!</p>
          </div>
        )}

        {formData.topics.map((topic, topicIndex) => (
          <div key={topic.id} style={styles.topicCard}>
            <div style={styles.topicHeader}>
              <h4 style={styles.topicTitle}>Topic {topicIndex + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic.id)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>

            <div>
              <div style={styles.formSection}>
                <label style={styles.label}>
                  <span>Topic Name</span>
                  <span style={styles.requiredStar}>*</span>
                </label>
                <input
                  type="text"
                  value={topic.name}
                  onChange={(e) => handleTopicChange(topic.id, "name", e.target.value)}
                  required
                  placeholder="e.g., React Hooks"
                  style={styles.input}
                />
              </div>

              <div style={styles.formSection}>
                <label style={styles.label}>
                  <span>Description</span>
                </label>
                <textarea
                  rows="2"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(topic.id, "description", e.target.value)}
                  placeholder="What will you learn in this topic?"
                  style={styles.textarea}
                ></textarea>
              </div>

              <div style={styles.resourcesSection}>
                <div style={styles.sectionHeader}>
                  <h5 style={styles.subsectionTitle}>Resources</h5>
                  <button
                    type="button"
                    onClick={() => handleAddResource(topic.id)}
                    style={styles.addResourceButton}
                  >
                    <span style={{ marginRight: "4px" }}>+</span> Add Resource
                  </button>
                </div>

                {(!topic.resources || topic.resources.length === 0) && (
                  <div style={{ ...styles.emptyState, padding: "1.5rem" }}>
                    <p>No resources added yet. Add materials to help you learn this topic.</p>
                  </div>
                )}

                {topic.resources && topic.resources.map((resource, resourceIndex) => (
                  <div key={resource.id} style={styles.resourceCard}>
                    <div style={styles.resourceHeader}>
                      <h6 style={styles.resourceTitle}>Resource {resourceIndex + 1}</h6>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(topic.id, resource.id)}
                        style={{ ...styles.removeButton, padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}
                      >
                        Remove
                      </button>
                    </div>

                    <div style={styles.resourceGrid}>
                      <div style={styles.resourceField}>
                        <label style={{ ...styles.label, fontSize: "0.9rem" }}>
                          <span>Title</span>
                          <span style={styles.requiredStar}>*</span>
                        </label>
                        <input
                          type="text"
                          value={resource.title}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "title", e.target.value)}
                          required
                          placeholder="e.g., React Hooks Tutorial"
                          style={{ ...styles.input, fontSize: "0.875rem", padding: "0.6rem 0.8rem" }}
                        />
                      </div>

                      <div style={styles.resourceField}>
                        <label style={{ ...styles.label, fontSize: "0.9rem" }}>
                          <span>Type</span>
                        </label>
                        <select
                          value={resource.type}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "type", e.target.value)}
                          style={styles.select}
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="book">Book</option>
                          <option value="course">Course</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div style={{ ...styles.resourceField, ...styles.fullWidth }}>
                        <label style={{ ...styles.label, fontSize: "0.9rem" }}>
                          <span>URL</span>
                        </label>
                        <input
                          type="url"
                          value={resource.url}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "url", e.target.value)}
                          placeholder="https://example.com/resource"
                          style={{ ...styles.input, fontSize: "0.875rem", padding: "0.6rem 0.8rem" }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          style={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={styles.submitButton}
        >
          {plan ? "Update" : "Create"} Learning Plan
        </button>
      </div>
    </form>
  );
};

export default LearningPlanForm;
