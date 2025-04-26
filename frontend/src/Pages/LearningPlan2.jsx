import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Calendar,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Edit3,
  BarChart2,
  FileText,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

const defaultGoal = {
  title: "",
  targetDate: "",
  topics: [],
  projectIdeas: [],
};

export default function LearningPlanCreator() {
  const [learningPlan, setLearningPlan] = useState(defaultGoal);
  const [activeTab, setActiveTab] = useState("topics");
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    tasks: [],
  });
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    relatedTopics: [],
  });
  const [newTask, setNewTask] = useState({
    title: "",
    priority: "medium",
    dueDate: "",
    completed: false,
  });
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTopicIndex, setEditingTopicIndex] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [expandedTopic, setExpandedTopic] = useState(null);

  // DND Setup
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Toast notification
  const showToastNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Calculate progress
  const calculateProgress = () => {
    if (learningPlan.topics.length === 0) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    learningPlan.topics.forEach((topic) => {
      totalTasks += topic.tasks.length;
      completedTasks += topic.tasks.filter((task) => task.completed).length;
    });

    return totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);
  };

  // Add new topic
  const handleAddTopic = () => {
    if (!newTopic.title) return;

    const topicToAdd = {
      ...newTopic,
      id: Date.now().toString(),
      tasks: [],
    };

    setLearningPlan((prev) => ({
      ...prev,
      topics: [...prev.topics, topicToAdd],
    }));

    setNewTopic({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      tasks: [],
    });
    setShowAddTopic(false);
    showToastNotification("Topic added successfully!");
  };

  // Add new project
  const handleAddProject = () => {
    if (!newProject.title) return;

    const projectToAdd = {
      ...newProject,
      id: Date.now().toString(),
    };

    setLearningPlan((prev) => ({
      ...prev,
      projectIdeas: [...prev.projectIdeas, projectToAdd],
    }));

    setNewProject({ title: "", description: "", relatedTopics: [] });
    setShowAddProject(false);
    showToastNotification("Project idea added successfully!");
  };

  // Add task to topic
  const handleAddTask = (topicId) => {
    if (!newTask.title) return;

    const taskToAdd = {
      ...newTask,
      id: Date.now().toString(),
    };

    setLearningPlan((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, tasks: [...topic.tasks, taskToAdd] }
          : topic
      ),
    }));

    setNewTask({
      title: "",
      priority: "medium",
      dueDate: "",
      completed: false,
    });
    showToastNotification("Task added successfully!");
  };

  // Toggle task completion
  const toggleTaskCompletion = (topicId, taskId) => {
    setLearningPlan((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              tasks: topic.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, completed: !task.completed }
                  : task
              ),
            }
          : topic
      ),
    }));
  };

  // Edit topic
  const handleEditTopic = (topicId) => {
    const topicIndex = learningPlan.topics.findIndex(
      (topic) => topic.id === topicId
    );
    if (topicIndex === -1) return;

    setEditingTopicIndex(topicIndex);
    setEditingTopicId(topicId);
    setNewTopic({ ...learningPlan.topics[topicIndex] });
  };

  // Save edited topic
  const saveEditedTopic = () => {
    if (!newTopic.title) return;

    setLearningPlan((prev) => ({
      ...prev,
      topics: prev.topics.map((topic, index) =>
        index === editingTopicIndex ? { ...newTopic } : topic
      ),
    }));

    setNewTopic({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      tasks: [],
    });
    setEditingTopicId(null);
    setEditingTopicIndex(null);
    showToastNotification("Topic updated successfully!");
  };

  // Delete topic
  const deleteTopic = (topicId) => {
    setLearningPlan((prev) => ({
      ...prev,
      topics: prev.topics.filter((topic) => topic.id !== topicId),
    }));
    showToastNotification("Topic deleted successfully!");
  };

  // Delete task
  const deleteTask = (topicId, taskId) => {
    setLearningPlan((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              tasks: topic.tasks.filter((task) => task.id !== taskId),
            }
          : topic
      ),
    }));
    showToastNotification("Task deleted successfully!");
  };

  // Delete project
  const deleteProject = (projectId) => {
    setLearningPlan((prev) => ({
      ...prev,
      projectIdeas: prev.projectIdeas.filter(
        (project) => project.id !== projectId
      ),
    }));
    showToastNotification("Project deleted successfully!");
  };

  // Handle DND end for topics
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setLearningPlan((prev) => {
        const oldIndex = prev.topics.findIndex(
          (topic) => topic.id === active.id
        );
        const newIndex = prev.topics.findIndex((topic) => topic.id === over.id);

        return {
          ...prev,
          topics: arrayMove(prev.topics, oldIndex, newIndex),
        };
      });
      showToastNotification("Topic order updated!");
    }
  };

  // Toggle topic expansion
  const toggleTopicExpansion = (topicId) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  // Autosave to localStorage (would be replaced with MongoDB in full implementation)
  useEffect(() => {
    const savedPlan = localStorage.getItem("learningPlan");
    if (savedPlan) {
      setLearningPlan(JSON.parse(savedPlan));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("learningPlan", JSON.stringify(learningPlan));
  }, [learningPlan]);

  // Component for sortable topic item
  function SortableTopicItem({ topic }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: topic.id });

    const style = {
      transform: transform ? `translateY(${transform.y}px)` : undefined,
      transition,
    };

    const isExpanded = expandedTopic === topic.id;
    const isEditing = editingTopicId === topic.id;
    const completedTasks = topic.tasks.filter((task) => task.completed).length;
    const totalTasks = topic.tasks.length;
    const topicProgress =
      totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border rounded-lg mb-4 bg-white shadow-sm"
      >
        <div
          className="p-4 flex items-center justify-between cursor-pointer"
          onClick={() => toggleTopicExpansion(topic.id)}
        >
          <div className="flex items-center">
            <div {...attributes} {...listeners} className="mr-3 cursor-move">
              <div className="w-6 h-6 flex flex-col items-center justify-center">
                <div className="w-4 h-0.5 bg-gray-400 mb-1"></div>
                <div className="w-4 h-0.5 bg-gray-400"></div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-lg">{topic.title}</h3>
              <div className="text-xs text-gray-500 flex items-center mt-1">
                <Calendar size={12} className="mr-1" />
                {topic.startDate && topic.endDate ? (
                  <span>
                    {topic.startDate} to {topic.endDate}
                  </span>
                ) : (
                  <span>No dates set</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="mr-4">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${topicProgress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-center">
                {completedTasks}/{totalTasks} tasks
              </div>
            </div>
            <div className="flex">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditTopic(topic.id);
                }}
                className="p-1 text-gray-500 hover:text-blue-500"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTopic(topic.id);
                }}
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
              {isExpanded ? (
                <ChevronDown size={20} className="ml-2" />
              ) : (
                <ChevronRight size={20} className="ml-2" />
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4">
            {topic.description && (
              <p className="text-sm text-gray-600 mb-4">{topic.description}</p>
            )}

            <h4 className="font-medium text-sm mb-2">Tasks</h4>

            {topic.tasks.length > 0 ? (
              <div className="mb-4">
                {topic.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-2 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleTaskCompletion(topic.id, task.id)}
                        className={`flex-shrink-0 w-5 h-5 mr-3 rounded border ${
                          task.completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        } flex items-center justify-center`}
                      >
                        {task.completed && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>
                      <div
                        className={`${
                          task.completed ? "line-through text-gray-400" : ""
                        }`}
                      >
                        <div className="font-medium text-sm">{task.title}</div>
                        {task.dueDate && (
                          <div className="text-xs text-gray-500">
                            Due: {task.dueDate}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(topic.id, task.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 mb-4">No tasks yet</div>
            )}

            {/* Add Task Form */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h5 className="text-sm font-medium mb-2">Add New Task</h5>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="border rounded p-2 text-sm"
                />
                <div className="flex space-x-2">
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, priority: e.target.value })
                    }
                    className="border rounded p-2 text-sm flex-1"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                    className="border rounded p-2 text-sm flex-1"
                  />
                </div>
                <button
                  onClick={() => handleAddTask(topic.id)}
                  className="bg-blue-500 text-white rounded py-2 text-sm hover:bg-blue-600"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gray-50 p-6 rounded-xl">
      {/* Header with Goal & Progress */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Learning Plan Creator</h1>
          <div className="flex items-center">
            <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden mr-3">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <span className="text-sm font-medium">{calculateProgress()}%</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:space-x-4">
          <div className="flex-1 mb-4 md:mb-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Learning Goal
            </label>
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={learningPlan.title}
              onChange={(e) =>
                setLearningPlan({ ...learningPlan, title: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Date
            </label>
            <input
              type="date"
              placeholder="Target completion date"
              value={learningPlan.targetDate}
              onChange={(e) =>
                setLearningPlan({ ...learningPlan, targetDate: e.target.value })
              }
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex mb-6">
        <button
          className={`flex items-center py-2 px-4 border-b-2 mr-4 ${
            activeTab === "topics"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("topics")}
        >
          <FileText size={18} className="mr-2" />
          Topics & Tasks
        </button>
        <button
          className={`flex items-center py-2 px-4 border-b-2 ${
            activeTab === "projects"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setActiveTab("projects")}
        >
          <BarChart2 size={18} className="mr-2" />
          Project Ideas
        </button>
      </div>

      {/* Topics Tab */}
      {activeTab === "topics" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Topics & Milestones</h2>
            <button
              onClick={() => {
                setShowAddTopic(true);
                setEditingTopicId(null);
                setNewTopic({
                  title: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                  tasks: [],
                });
              }}
              className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              Add Topic
            </button>
          </div>

          {showAddTopic && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-3">
                {editingTopicId ? "Edit Topic" : "Add New Topic"}
              </h3>
              <div className="flex flex-col space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Topic title"
                    value={newTopic.title}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, title: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of this topic"
                    value={newTopic.description}
                    onChange={(e) =>
                      setNewTopic({ ...newTopic, description: e.target.value })
                    }
                    className="w-full border rounded-md p-2 h-20"
                  />
                </div>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newTopic.startDate}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, startDate: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={newTopic.endDate}
                      onChange={(e) =>
                        setNewTopic({ ...newTopic, endDate: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddTopic(false)}
                    className="border border-gray-300 rounded-md py-2 px-4 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingTopicId ? saveEditedTopic : handleAddTopic}
                    className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600"
                  >
                    {editingTopicId ? "Save Changes" : "Add Topic"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Topics List with DND */}
          {learningPlan.topics.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={learningPlan.topics.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {learningPlan.topics.map((topic) => (
                  <SortableTopicItem key={topic.id} topic={topic} />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                No topics added yet. Get started by adding your first topic.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === "projects" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Project Ideas</h2>
            <button
              onClick={() => {
                setShowAddProject(true);
                setEditingProjectId(null);
                setNewProject({
                  title: "",
                  description: "",
                  relatedTopics: [],
                });
              }}
              className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              Add Project Idea
            </button>
          </div>

          {showAddProject && (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h3 className="text-lg font-medium mb-3">
                {editingProjectId
                  ? "Edit Project Idea"
                  : "Add New Project Idea"}
              </h3>
              <div className="flex flex-col space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Project title"
                    value={newProject.title}
                    onChange={(e) =>
                      setNewProject({ ...newProject, title: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of this project idea"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({
                        ...newProject,
                        description: e.target.value,
                      })
                    }
                    className="w-full border rounded-md p-2 h-20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Related Topics
                  </label>
                  <select
                    multiple
                    value={newProject.relatedTopics}
                    onChange={(e) => {
                      const selectedTopics = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value
                      );
                      setNewProject({
                        ...newProject,
                        relatedTopics: selectedTopics,
                      });
                    }}
                    className="w-full border rounded-md p-2 h-20"
                  >
                    {learningPlan.topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Hold Ctrl/Cmd to select multiple topics
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowAddProject(false)}
                    className="border border-gray-300 rounded-md py-2 px-4 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProject}
                    className="bg-blue-500 text-white rounded-md py-2 px-4 hover:bg-blue-600"
                  >
                    {editingProjectId ? "Save Changes" : "Add Project"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects List */}
          {learningPlan.projectIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningPlan.projectIdeas.map((project) => (
                <div
                  key={project.id}
                  className="bg-white p-4 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-lg">{project.title}</h3>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="p-1 text-gray-500 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 mb-3">
                    {project.description}
                  </p>

                  {project.relatedTopics &&
                    project.relatedTopics.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 mb-2">
                          Related Topics:
                        </h4>
                        <div className="flex flex-wrap">
                          {project.relatedTopics.map((topicId) => {
                            const topic = learningPlan.topics.find(
                              (t) => t.id === topicId
                            );
                            return topic ? (
                              <span
                                key={topicId}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-2"
                              >
                                {topic.title}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500">
                No project ideas added yet. Add some to practice your skills.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center">
          <Check size={16} className="mr-2" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
