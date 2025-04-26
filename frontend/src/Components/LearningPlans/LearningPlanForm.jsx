// frontend/src/Components/LearningPlans/LearningPlanForm.jsx
import React, { useState, useEffect } from "react";
import { v4 } from "uuid";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublic"
          name="isPublic"
          checked={formData.isPublic}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
          Make this learning plan public
        </label>
      </div>

      <div>
        <label htmlFor="completionDeadline" className="block text-sm font-medium text-gray-700">
          Completion Deadline
        </label>
        <input
          type="date"
          id="completionDeadline"
          name="completionDeadline"
          value={formData.completionDeadline}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Topics</h3>
          <button
            type="button"
            onClick={handleAddTopic}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Topic
          </button>
        </div>

        {formData.topics.map((topic, topicIndex) => (
          <div key={topic.id} className="border border-gray-200 rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-700">Topic {topicIndex + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic.id)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Topic Name
                </label>
                <input
                  type="text"
                  value={topic.name}
                  onChange={(e) => handleTopicChange(topic.id, "name", e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={topic.description}
                  onChange={(e) => handleTopicChange(topic.id, "description", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-sm font-medium text-gray-700">Resources</h5>
                  <button
                    type="button"
                    onClick={() => handleAddResource(topic.id)}
                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Resource
                  </button>
                </div>

                {topic.resources && topic.resources.map((resource, resourceIndex) => (
                  <div key={resource.id} className="border border-gray-100 rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-xs font-medium text-gray-700">Resource {resourceIndex + 1}</h6>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(topic.id, resource.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">
                          Title
                        </label>
                        <input
                          type="text"
                          value={resource.title}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "title", e.target.value)}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          value={resource.type}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "type", e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="book">Book</option>
                          <option value="course">Course</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700">
                          URL
                        </label>
                        <input
                          type="url"
                          value={resource.url}
                          onChange={(e) => handleResourceChange(topic.id, resource.id, "url", e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs"
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

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {plan ? "Update" : "Create"} Learning Plan
        </button>
      </div>
    </form>
  );
};

export default LearningPlanForm;
