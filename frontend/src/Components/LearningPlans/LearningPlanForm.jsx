import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const LearningPlanForm = ({ plan, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublic: false,
    completionDeadline: "",
    topics: [],
  });

  useEffect(() => {
    if (plan) {
      const deadline = plan.completionDeadline
        ? new Date(plan.completionDeadline).toISOString().split("T")[0]
        : "";

      setFormData({
        ...plan,
        completionDeadline: deadline,
      });
    }
  }, [plan]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
          completed: false,
        },
      ],
    });
  };

  const handleRemoveTopic = (topicId) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((topic) => topic.id !== topicId),
    });
  };

  const handleTopicChange = (topicId, field, value) => {
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) =>
        topic.id === topicId ? { ...topic, [field]: value } : topic
      ),
    });
  };

  const handleAddResource = (topicId) => {
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) => {
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
                completed: false,
              },
            ],
          };
        }
        return topic;
      }),
    });
  };

  const handleRemoveResource = (topicId, resourceId) => {
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.filter(
              (resource) => resource.id !== resourceId
            ),
          };
        }
        return topic;
      }),
    });
  };

  const handleResourceChange = (topicId, resourceId, field, value) => {
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) => {
        if (topic.id === topicId) {
          return {
            ...topic,
            resources: topic.resources.map((resource) =>
              resource.id === resourceId
                ? { ...resource, [field]: value }
                : resource
            ),
          };
        }
        return topic;
      }),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...formData,
      completionDeadline: formData.completionDeadline
        ? new Date(formData.completionDeadline)
        : null,
    };
    onSubmit(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 font-sans"
    >
      <div className="text-center mb-8 pb-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-indigo-400 mb-2">
          {plan ? "Update" : "Create"} Your Learning Journey
        </h2>
        <p className="text-gray-400">
          Design a structured path to achieve your learning goals
        </p>
      </div>

      <div className="mb-6">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          <span>Title</span>
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g., Mastering React Development"
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          <span>Description</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your learning goals and what you hope to achieve..."
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[100px]"
        ></textarea>
      </div>

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="w-5 h-5 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
          Make this learning plan public
        </label>
      </div>

      <div className="mb-6">
        <label
          htmlFor="completionDeadline"
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          <span>Completion Deadline</span>
        </label>
        <input
          type="date"
          id="completionDeadline"
          name="completionDeadline"
          value={formData.completionDeadline}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-200">Topics</h3>
          <button
            type="button"
            onClick={handleAddTopic}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center transition-all"
          >
            <span className="mr-1">+</span> Add Topic
          </button>
        </div>

        {formData.topics.length === 0 && (
          <div className="text-center p-8 bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 mb-6">
            <p>
              No topics added yet. Add your first learning topic to get started!
            </p>
          </div>
        )}

        {formData.topics.map((topic, topicIndex) => (
          <div
            key={topic.id}
            className="bg-gray-700/30 rounded-xl p-6 mb-6 border border-gray-700 shadow"
          >
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
              <h4 className="text-lg font-semibold text-gray-200">
                Topic {topicIndex + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic.id)}
                className="px-3 py-1 text-red-400 hover:text-red-300 border border-red-500 hover:border-red-400 rounded text-sm font-medium transition-all"
              >
                Remove
              </button>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <span>Topic Name</span>
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={topic.name}
                  onChange={(e) =>
                    handleTopicChange(topic.id, "name", e.target.value)
                  }
                  required
                  placeholder="e.g., React Hooks"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  <span>Description</span>
                </label>
                <textarea
                  rows="2"
                  value={topic.description}
                  onChange={(e) =>
                    handleTopicChange(topic.id, "description", e.target.value)
                  }
                  placeholder="What will you learn in this topic?"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[80px]"
                ></textarea>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="text-base font-medium text-gray-300">
                    Resources
                  </h5>
                  <button
                    type="button"
                    onClick={() => handleAddResource(topic.id)}
                    className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-sm font-medium flex items-center transition-all"
                  >
                    <span className="mr-1">+</span> Add Resource
                  </button>
                </div>

                {(!topic.resources || topic.resources.length === 0) && (
                  <div className="text-center p-6 bg-gray-700/50 rounded-lg border border-dashed border-gray-600 text-gray-400 mb-4">
                    <p>
                      No resources added yet. Add materials to help you learn
                      this topic.
                    </p>
                  </div>
                )}

                {topic.resources &&
                  topic.resources.map((resource, resourceIndex) => (
                    <div
                      key={resource.id}
                      className="bg-gray-700 rounded-lg p-4 mb-4 border border-gray-600"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="text-sm font-semibold text-gray-300">
                          Resource {resourceIndex + 1}
                        </h6>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveResource(topic.id, resource.id)
                          }
                          className="px-2 py-1 text-red-400 hover:text-red-300 border border-red-500 hover:border-red-400 rounded text-xs font-medium transition-all"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            <span>Title</span>
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            type="text"
                            value={resource.title}
                            onChange={(e) =>
                              handleResourceChange(
                                topic.id,
                                resource.id,
                                "title",
                                e.target.value
                              )
                            }
                            required
                            placeholder="e.g., React Hooks Tutorial"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            <span>Type</span>
                          </label>
                          <select
                            value={resource.type}
                            onChange={(e) =>
                              handleResourceChange(
                                topic.id,
                                resource.id,
                                "type",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNiA5bDYgNiA2LTYiLz48L3N2Zz4=')] bg-no-repeat bg-[right_0.75rem_center] bg-[length:16px_12px] pr-8"
                          >
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="book">Book</option>
                            <option value="course">Course</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            <span>URL</span>
                          </label>
                          <input
                            type="url"
                            value={resource.url}
                            onChange={(e) =>
                              handleResourceChange(
                                topic.id,
                                resource.id,
                                "url",
                                e.target.value
                              )
                            }
                            placeholder="https://example.com/resource"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
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

      <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-transparent hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-600 rounded-lg font-medium transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-md hover:shadow-indigo-500/20 transition-all"
        >
          {plan ? "Update" : "Create"} Learning Plan
        </button>
      </div>
    </form>
  );
};

export default LearningPlanForm;
