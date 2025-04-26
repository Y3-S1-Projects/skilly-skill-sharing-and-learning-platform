import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Save,
  Plus,
  FileText,
  Clock,
  BookOpen,
  CheckCircle,
  Layout,
  Target,
  Layers,
  Calendar,
  CheckSquare,
  PieChart,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const LearningPlanCreator = () => {
  // Main state
  const [plan, setPlan] = useState({
    title: "Untitled Learning Plan",
    description: "",
    goal: { objective: "", motivation: "" },
    topics: [],
    projects: [],
    timeline: { startDate: null, endDate: null },
  });

  // Canvas elements state
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentView, setCurrentView] = useState("canvas"); // canvas, timeline, tasks, projects, dashboard
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState({
    saving: false,
    success: false,
    error: null,
  });
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Refs
  const canvasRef = useRef(null);
  const autoSaveTimerRef = useRef(null);

  // Element types that can be added to the canvas
  const elementTypes = [
    {
      id: "topic",
      name: "Topic",
      icon: <FileText size={16} />,
      color: "#3B82F6",
    },
    {
      id: "subtopic",
      name: "Subtopic",
      icon: <Layers size={16} />,
      color: "#6366F1",
    },
    {
      id: "resource",
      name: "Resource",
      icon: <BookOpen size={16} />,
      color: "#10B981",
    },
    {
      id: "milestone",
      name: "Milestone",
      icon: <CheckCircle size={16} />,
      color: "#F59E0B",
    },
    {
      id: "task",
      name: "Task",
      icon: <CheckSquare size={16} />,
      color: "#EF4444",
    },
    {
      id: "project",
      name: "Project",
      icon: <Briefcase size={16} />,
      color: "#8B5CF6",
    },
    {
      id: "timeframe",
      name: "Timeframe",
      icon: <Clock size={16} />,
      color: "#EC4899",
    },
    {
      id: "section",
      name: "Section",
      icon: <Layout size={16} />,
      color: "#6B7280",
    },
  ];

  // Task status options
  const taskStatusOptions = [
    { id: "not-started", name: "Not Started", color: "#9CA3AF" },
    { id: "in-progress", name: "In Progress", color: "#3B82F6" },
    { id: "completed", name: "Completed", color: "#10B981" },
  ];

  // Add a new element to the canvas
  const addElement = (type) => {
    const elementType = elementTypes.find((el) => el.id === type);
    if (!elementType) return;

    // Default properties for the element type
    const defaultProps = {};

    if (type === "topic" || type === "subtopic") {
      defaultProps.startDate = new Date();
      defaultProps.endDate = new Date(
        new Date().setDate(new Date().getDate() + 14)
      );
      defaultProps.status = "not-started";
      defaultProps.progress = 0;
      defaultProps.tasks = [];
    } else if (type === "task") {
      defaultProps.dueDate = new Date(
        new Date().setDate(new Date().getDate() + 7)
      );
      defaultProps.status = "not-started";
    } else if (type === "project") {
      defaultProps.startDate = new Date();
      defaultProps.endDate = new Date(
        new Date().setDate(new Date().getDate() + 30)
      );
      defaultProps.status = "not-started";
      defaultProps.relatedTopics = [];
    }

    const newElement = {
      id: `element-${Date.now()}`,
      type: type,
      title: `New ${elementType.name}`,
      description: "",
      x: 100,
      y: 100,
      width: type === "section" ? 300 : 200,
      height: type === "section" ? 300 : 150,
      color: elementType.color,
      zIndex: elements.length,
      ...defaultProps,
    };

    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);

    // Update plan state based on element type
    if (type === "topic") {
      setPlan({
        ...plan,
        topics: [
          ...plan.topics,
          {
            id: newElement.id,
            title: newElement.title,
            description: "",
            startDate: newElement.startDate,
            endDate: newElement.endDate,
            status: newElement.status,
            progress: newElement.progress,
            position: {
              x: newElement.x,
              y: newElement.y,
              width: newElement.width,
              height: newElement.height,
            },
            tasks: [],
            resources: [],
          },
        ],
      });
    } else if (type === "project") {
      setPlan({
        ...plan,
        projects: [
          ...plan.projects,
          {
            id: newElement.id,
            title: newElement.title,
            description: "",
            startDate: newElement.startDate,
            endDate: newElement.endDate,
            status: newElement.status,
            relatedTopics: [],
          },
        ],
      });
    }

    triggerAutoSave();
  };

  // Handle mouse down on an element
  const handleElementMouseDown = (e, elementId) => {
    e.stopPropagation();
    setSelectedElement(elementId);

    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const offsetX = e.clientX - canvasRect.left - element.x;
    const offsetY = e.clientY - canvasRect.top - element.y;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  // Handle mouse move for dragging elements
  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    setElements(
      elements.map((element) => {
        if (element.id === selectedElement) {
          return { ...element, x, y };
        }
        return element;
      })
    );

    // Update position in plan state
    const element = elements.find((el) => el.id === selectedElement);
    if (element && element.type === "topic") {
      setPlan({
        ...plan,
        topics: plan.topics.map((topic) => {
          if (topic.id === selectedElement) {
            return {
              ...topic,
              position: { ...topic.position, x, y },
            };
          }
          return topic;
        }),
      });
    }
  };

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    if (isDragging) {
      triggerAutoSave();
    }
    setIsDragging(false);
  };

  // Handle canvas click to deselect elements
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElement(null);
    }
  };

  // Update element title and description
  const updateElementContent = (elementId, field, value) => {
    setElements(
      elements.map((element) => {
        if (element.id === elementId) {
          return { ...element, [field]: value };
        }
        return element;
      })
    );

    // Update in plan state
    const element = elements.find((el) => el.id === elementId);
    if (element) {
      if (element.type === "topic") {
        setPlan({
          ...plan,
          topics: plan.topics.map((topic) => {
            if (topic.id === elementId) {
              return { ...topic, [field]: value };
            }
            return topic;
          }),
        });
      } else if (element.type === "project") {
        setPlan({
          ...plan,
          projects: plan.projects.map((project) => {
            if (project.id === elementId) {
              return { ...project, [field]: value };
            }
            return project;
          }),
        });
      }
    }

    triggerAutoSave();
  };

  // Update element status
  const updateElementStatus = (elementId, status) => {
    setElements(
      elements.map((element) => {
        if (element.id === elementId) {
          return { ...element, status };
        }
        return element;
      })
    );

    // Update in plan state
    const element = elements.find((el) => el.id === elementId);
    if (element) {
      if (element.type === "topic") {
        setPlan({
          ...plan,
          topics: plan.topics.map((topic) => {
            if (topic.id === elementId) {
              return { ...topic, status };
            }
            return topic;
          }),
        });
      } else if (element.type === "task") {
        // Find the parent topic
        const parentTopic = plan.topics.find((topic) =>
          topic.tasks.some((task) => task.id === elementId)
        );

        if (parentTopic) {
          setPlan({
            ...plan,
            topics: plan.topics.map((topic) => {
              if (topic.id === parentTopic.id) {
                return {
                  ...topic,
                  tasks: topic.tasks.map((task) => {
                    if (task.id === elementId) {
                      return { ...task, status };
                    }
                    return task;
                  }),
                  // Recalculate progress based on tasks
                  progress: calculateTopicProgress(parentTopic.id, status),
                };
              }
              return topic;
            }),
          });
        }
      } else if (element.type === "project") {
        setPlan({
          ...plan,
          projects: plan.projects.map((project) => {
            if (project.id === elementId) {
              return { ...project, status };
            }
            return project;
          }),
        });
      }
    }

    triggerAutoSave();
  };

  // Calculate topic progress based on completed tasks
  const calculateTopicProgress = (topicId, updatedTaskStatus = null) => {
    const topic = plan.topics.find((t) => t.id === topicId);
    if (!topic || !topic.tasks || topic.tasks.length === 0) return 0;

    const completedTasks = topic.tasks.filter(
      (task) =>
        task.status === "completed" ||
        (updatedTaskStatus && task.id === selectedElement
          ? updatedTaskStatus === "completed"
          : false)
    ).length;

    return Math.round((completedTasks / topic.tasks.length) * 100);
  };

  // Delete selected element
  const deleteElement = (elementId) => {
    const element = elements.find((el) => el.id === elementId);

    setElements(elements.filter((element) => element.id !== elementId));
    setSelectedElement(null);

    // Remove from plan state
    if (element) {
      if (element.type === "topic") {
        setPlan({
          ...plan,
          topics: plan.topics.filter((topic) => topic.id !== elementId),
        });
      } else if (element.type === "project") {
        setPlan({
          ...plan,
          projects: plan.projects.filter((project) => project.id !== elementId),
        });
      } else if (element.type === "task") {
        // Find and update the parent topic
        const parentTopic = plan.topics.find((topic) =>
          topic.tasks.some((task) => task.id === elementId)
        );

        if (parentTopic) {
          setPlan({
            ...plan,
            topics: plan.topics.map((topic) => {
              if (topic.id === parentTopic.id) {
                return {
                  ...topic,
                  tasks: topic.tasks.filter((task) => task.id !== elementId),
                };
              }
              return topic;
            }),
          });
        }
      }
    }

    triggerAutoSave();
  };

  // Add a task to a topic
  const addTaskToTopic = (topicId) => {
    const topic = plan.topics.find((t) => t.id === topicId);
    if (!topic) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: "New Task",
      description: "",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: "not-started",
    };

    // Add to topic in plan
    setPlan({
      ...plan,
      topics: plan.topics.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            tasks: [...t.tasks, newTask],
          };
        }
        return t;
      }),
    });

    // Add to canvas elements
    const topicElement = elements.find((el) => el.id === topicId);
    if (topicElement) {
      const newTaskElement = {
        id: newTask.id,
        type: "task",
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        status: newTask.status,
        x: topicElement.x + 50,
        y: topicElement.y + 50,
        width: 180,
        height: 120,
        color: "#EF4444",
        zIndex: elements.length,
        parentTopicId: topicId,
      };

      setElements([...elements, newTaskElement]);
    }

    triggerAutoSave();
  };

  // Update goal information
  const updateGoal = (field, value) => {
    setPlan({
      ...plan,
      goal: {
        ...plan.goal,
        [field]: value,
      },
    });

    triggerAutoSave();
  };

  // Update plan title/description
  const updatePlan = (field, value) => {
    setPlan({
      ...plan,
      [field]: value,
    });

    triggerAutoSave();
  };

  // Update timeline dates
  const updateTimeline = (field, value) => {
    setPlan({
      ...plan,
      timeline: {
        ...plan.timeline,
        [field]: value,
      },
    });

    triggerAutoSave();
  };

  // Auto-save functionality
  const triggerAutoSave = () => {
    if (!autoSaveEnabled) return;

    // Clear any existing timeout
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timeout for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      savePlan();
    }, 2000); // Auto-save after 2 seconds of inactivity
  };

  // Save learning plan to MongoDB
  const savePlan = async () => {
    setSaveStatus({ saving: true, success: false, error: null });

    try {
      // Update positions from elements to plan topics
      const updatedPlan = {
        ...plan,
        topics: plan.topics.map((topic) => {
          const topicElement = elements.find((el) => el.id === topic.id);
          if (topicElement) {
            return {
              ...topic,
              position: {
                x: topicElement.x,
                y: topicElement.y,
                width: topicElement.width,
                height: topicElement.height,
              },
            };
          }
          return topic;
        }),
      };

      // This would be the actual API call when implementing the backend
      /*
      const response = await fetch("/api/learning-plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedPlan),
      });

      if (!response.ok) {
        throw new Error("Failed to save learning plan");
      }
      */

      // For demonstration, we'll just simulate a successful save
      console.log("Plan saved:", updatedPlan);

      setSaveStatus({ saving: false, success: true, error: null });
      setTimeout(
        () => setSaveStatus((prev) => ({ ...prev, success: false })),
        3000
      );
    } catch (err) {
      setSaveStatus({ saving: false, success: false, error: err.message });
    }
  };

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (!plan.topics || plan.topics.length === 0) return 0;

    const totalTopics = plan.topics.length;
    const completedTopics = plan.topics.filter(
      (topic) => topic.status === "completed"
    ).length;
    const inProgressTopics = plan.topics.filter(
      (topic) => topic.status === "in-progress"
    ).length;

    // Count in-progress topics as half-completed for the calculation
    return Math.round(
      ((completedTopics + inProgressTopics * 0.5) / totalTopics) * 100
    );
  };

  // Set up event listeners
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      // Clear auto-save timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDragging, selectedElement, dragOffset, elements, plan]);

  // Render goal definition modal
  const renderGoalModal = () => {
    if (!showGoalModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Define Your Learning Goal</h2>
            <button
              onClick={() => setShowGoalModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              What do you want to learn?
            </label>
            <textarea
              value={plan.goal.objective}
              onChange={(e) => updateGoal("objective", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-24"
              placeholder="E.g., I want to learn React and build a full-stack web application"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why is this important to you?
            </label>
            <textarea
              value={plan.goal.motivation}
              onChange={(e) => updateGoal("motivation", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 h-24"
              placeholder="E.g., To advance my career as a front-end developer and build projects I'm passionate about"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowGoalModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Goal
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render element properties panel
  const renderElementProperties = () => {
    if (!selectedElement) return null;

    const element = elements.find((el) => el.id === selectedElement);
    if (!element) return null;

    return (
      <div className="bg-white border-l border-gray-200 w-80 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">
            {elementTypes.find((t) => t.id === element.type)?.name} Properties
          </h3>
          <button
            onClick={() => setSelectedElement(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={element.title}
              onChange={(e) =>
                updateElementContent(element.id, "title", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={element.description || ""}
              onChange={(e) =>
                updateElementContent(element.id, "description", e.target.value)
              }
              className="w-full border border-gray-300 rounded-md p-2 h-24"
            />
          </div>

          {(element.type === "topic" ||
            element.type === "subtopic" ||
            element.type === "project") && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={
                      element.startDate
                        ? new Date(element.startDate)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateElementContent(
                        element.id,
                        "startDate",
                        new Date(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      element.endDate
                        ? new Date(element.endDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      updateElementContent(
                        element.id,
                        "endDate",
                        new Date(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={element.status || "not-started"}
                  onChange={(e) =>
                    updateElementStatus(element.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  {taskStatusOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {element.type === "task" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={
                    element.dueDate
                      ? new Date(element.dueDate).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updateElementContent(
                      element.id,
                      "dueDate",
                      new Date(e.target.value)
                    )
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={element.status || "not-started"}
                  onChange={(e) =>
                    updateElementStatus(element.id, e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  {taskStatusOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {element.type === "resource" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={element.url || ""}
                onChange={(e) =>
                  updateElementContent(element.id, "url", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md p-2"
                placeholder="https://..."
              />
            </div>
          )}

          {element.type === "topic" && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">Tasks</h4>
                <button
                  onClick={() => addTaskToTopic(element.id)}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
                >
                  <Plus size={16} />
                  Add Task
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {plan.topics
                  .find((t) => t.id === element.id)
                  ?.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 border rounded-md flex justify-between items-center"
                      style={{
                        borderLeftColor: taskStatusOptions.find(
                          (o) => o.id === task.status
                        )?.color,
                        borderLeftWidth: "4px",
                      }}
                    >
                      <div className="truncate">{task.title}</div>
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedElement(task.id)}
                          className="text-gray-500 hover:text-blue-600 mr-1"
                        >
                          <FileText size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                {plan.topics.find((t) => t.id === element.id)?.tasks.length ===
                  0 && (
                  <div className="text-gray-500 text-sm italic">
                    No tasks yet. Add your first task!
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <button
              onClick={() => deleteElement(element.id)}
              className="px-3 py-1 bg-red-600 text-white rounded flex items-center gap-1 hover:bg-red-700"
            >
              <X size={14} />
              Delete {elementTypes.find((t) => t.id === element.type)?.name}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the progress dashboard view
  const renderProgressDashboard = () => {
    const overallProgress = calculateOverallProgress();

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Learning Progress Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Overall Progress Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Overall Progress</h3>
              <div className="text-2xl font-bold">{overallProgress}%</div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>

            <div className="mt-4 grid grid-cols-3 text-center">
              <div>
                <div className="text-sm text-gray-500">Topics</div>
                <div className="font-bold">{plan.topics.length}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Completed</div>
                <div className="font-bold">
                  {plan.topics.filter((t) => t.status === "completed").length}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">In Progress</div>
                <div className="font-bold">
                  {plan.topics.filter((t) => t.status === "in-progress").length}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Goal Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Learning Goal</h3>
              <button
                onClick={() => setShowGoalModal(true)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
            </div>

            {plan.goal.objective ? (
              <>
                <div className="mb-2">
                  <div className="text-sm text-gray-500 mb-1">
                    What I want to learn:
                  </div>
                  <div className="text-gray-700">{plan.goal.objective}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Why it's important:
                  </div>
                  <div className="text-gray-700">{plan.goal.motivation}</div>
                </div>
              </>
            ) : (
              <div className="text-gray-500 italic">
                Define your learning goal to stay motivated and focused.
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="text-blue-600 hover:text-blue-800 block mt-2"
                >
                  Define Goal Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Topics Progress */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Topic Progress</h3>

          {plan.topics.length > 0 ? (
            <div className="space-y-4">
              {plan.topics.map((topic) => (
                <div key={topic.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{topic.title}</h4>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          topic.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : topic.status === "in-progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {
                          taskStatusOptions.find((o) => o.id === topic.status)
                            ?.name
                        }
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${topic.progress || 0}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between text-xs mt-1">
                    <div className="text-gray-500">
                      {
                        topic.tasks.filter((t) => t.status === "completed")
                          .length
                      }{" "}
                      of {topic.tasks.length} tasks complete
                    </div>
                    <div className="font-medium">{topic.progress || 0}%</div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    {topic.startDate && topic.endDate ? (
                      <div className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(topic.startDate).toLocaleDateString()} to{" "}
                        {new Date(topic.endDate).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-gray-500 mb-4">
                You haven't created any topics yet.
              </div>
              <button
                onClick={() => {
                  setCurrentView("canvas");
                  addElement("topic");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
              >
                <Plus size={16} className="mr-1" />
                Add Your First Topic
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Upcoming Tasks</h3>

          {plan.topics
            .flatMap((t) => t.tasks)
            .filter((t) => t.status !== "completed").length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Topic
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plan.topics.flatMap((topic) =>
                    topic.tasks
                      .filter((task) => task.status !== "completed")
                      .map((task) => (
                        <tr key={task.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {task.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {topic.title}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "No date"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                task.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {
                                taskStatusOptions.find(
                                  (o) => o.id === task.status
                                )?.name
                              }
                            </span>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-gray-500">No pending tasks.</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the canvas view
  const renderCanvasView = () => {
    return (
      <div className="flex-1 overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full bg-gray-50 relative overflow-auto"
          onClick={handleCanvasClick}
        >
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute rounded-md shadow transition-shadow duration-200 ${
                selectedElement === element.id
                  ? "shadow-lg ring-2 ring-blue-500"
                  : "shadow hover:shadow-md"
              }`}
              style={{
                left: `${element.x}px`,
                top: `${element.y}px`,
                width: `${element.width}px`,
                height: `${element.height}px`,
                backgroundColor: element.color,
                opacity: element.type === "section" ? 0.2 : 1,
                border:
                  element.type === "section"
                    ? `2px dashed ${element.color}`
                    : undefined,
                zIndex: element.zIndex,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            >
              <div
                className={`p-3 h-full ${
                  element.type === "section" ? "border-2 border-dashed" : ""
                }`}
                style={{
                  borderColor:
                    element.type === "section" ? element.color : undefined,
                }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    {
                      elementTypes.find((type) => type.id === element.type)
                        ?.icon
                    }
                    <h3 className="font-medium text-sm ml-1 truncate">
                      {element.title}
                    </h3>
                  </div>

                  {element.type !== "section" && (
                    <div className="flex">
                      {(element.type === "topic" ||
                        element.type === "subtopic" ||
                        element.type === "task" ||
                        element.type === "project") && (
                        <div
                          className={`w-2 h-2 rounded-full mr-1 ${
                            element.status === "completed"
                              ? "bg-green-500"
                              : element.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        ></div>
                      )}
                    </div>
                  )}
                </div>

                {element.description && (
                  <div className="text-xs line-clamp-3 mt-1 opacity-80">
                    {element.description}
                  </div>
                )}

                {(element.type === "topic" || element.type === "subtopic") &&
                  element.tasks &&
                  element.tasks.length > 0 && (
                    <div className="mt-2 text-xs">
                      <div className="w-full bg-gray-200 bg-opacity-30 rounded-full h-1">
                        <div
                          className="bg-white h-1 rounded-full"
                          style={{ width: `${element.progress || 0}%` }}
                        ></div>
                      </div>
                      <div className="mt-1">
                        {
                          element.tasks.filter((t) => t.status === "completed")
                            .length
                        }
                        /{element.tasks.length} tasks
                      </div>
                    </div>
                  )}

                {element.dueDate && element.type === "task" && (
                  <div className="text-xs mt-2 flex items-center">
                    <Clock size={10} className="mr-1" />
                    Due {new Date(element.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the timeline view
  const renderTimelineView = () => {
    // Filter topics with dates
    const topicsWithDates = plan.topics.filter(
      (topic) => topic.startDate && topic.endDate
    );

    // Find min and max dates
    let minDate = new Date();
    let maxDate = new Date();

    if (topicsWithDates.length > 0) {
      minDate = new Date(
        Math.min(...topicsWithDates.map((t) => new Date(t.startDate).getTime()))
      );
      maxDate = new Date(
        Math.max(...topicsWithDates.map((t) => new Date(t.endDate).getTime()))
      );
    }

    // Extend timeline by a week on each end
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    // Calculate total days in timeline
    const totalDays = Math.floor((maxDate - minDate) / (1000 * 60 * 60 * 24));

    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Learning Timeline</h2>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Timeline Range</h3>
            <div className="text-sm text-gray-500">
              {plan.timeline.startDate
                ? new Date(plan.timeline.startDate).toLocaleDateString()
                : "Not set"}{" "}
              to{" "}
              {plan.timeline.endDate
                ? new Date(plan.timeline.endDate).toLocaleDateString()
                : "Not set"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={
                  plan.timeline.startDate
                    ? new Date(plan.timeline.startDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateTimeline("startDate", new Date(e.target.value))
                }
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={
                  plan.timeline.endDate
                    ? new Date(plan.timeline.endDate)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateTimeline("endDate", new Date(e.target.value))
                }
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        {topicsWithDates.length > 0 ? (
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <div style={{ minWidth: Math.max(800, totalDays * 20) }}>
              {/* Timeline Header */}
              <div className="flex mb-4">
                {Array.from({ length: Math.ceil(totalDays / 7) + 1 }).map(
                  (_, i) => {
                    const date = new Date(minDate);
                    date.setDate(date.getDate() + i * 7);
                    return (
                      <div
                        key={i}
                        className="flex-shrink-0"
                        style={{ width: "140px" }}
                      >
                        <div className="text-xs font-medium text-gray-500">
                          {date.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Timeline Grid */}
              <div className="relative">
                {/* Vertical Grid Lines */}
                <div className="absolute inset-0">
                  <div className="flex h-full">
                    {Array.from({ length: Math.ceil(totalDays / 7) + 1 }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="flex-shrink-0 border-l border-gray-200"
                          style={{ width: "140px", height: "100%" }}
                        ></div>
                      )
                    )}
                  </div>
                </div>

                {/* Timeline Items */}
                <div className="relative">
                  {topicsWithDates.map((topic, index) => {
                    const startDate = new Date(topic.startDate);
                    const endDate = new Date(topic.endDate);

                    // Calculate position and width
                    const daysFromStart = Math.floor(
                      (startDate - minDate) / (1000 * 60 * 60 * 24)
                    );
                    const durationDays =
                      Math.floor(
                        (endDate - startDate) / (1000 * 60 * 60 * 24)
                      ) + 1;

                    const leftPos = daysFromStart * 20;
                    const width = durationDays * 20;

                    return (
                      <div key={topic.id} className="mb-4 relative">
                        <div className="h-8 absolute flex items-center">
                          <div
                            className={`rounded-md h-6 cursor-pointer ${
                              topic.status === "completed"
                                ? "bg-green-200"
                                : topic.status === "in-progress"
                                ? "bg-blue-200"
                                : "bg-gray-200"
                            }`}
                            style={{
                              left: `${leftPos}px`,
                              width: `${width}px`,
                            }}
                            onClick={() => setSelectedElement(topic.id)}
                          >
                            <div className="px-2 text-xs font-medium truncate">
                              {topic.title}
                            </div>
                          </div>
                        </div>

                        <div className="h-8"></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-gray-500 mb-4">
              No topics with start and end dates yet.
            </div>
            <button
              onClick={() => {
                setCurrentView("canvas");
                addElement("topic");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add a Topic with Dates
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-600">
              Learning Plan Creator
            </h1>
            <input
              type="text"
              value={plan.title}
              onChange={(e) => updatePlan("title", e.target.value)}
              className="border-gray-300 rounded-md px-3 py-1.5 text-lg font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGoalModal(true)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center"
            >
              <Target size={16} className="mr-1" />
              {plan.goal.objective ? "Edit Goal" : "Set Goal"}
            </button>

            <button
              onClick={savePlan}
              disabled={saveStatus.saving}
              className={`px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center ${
                saveStatus.saving ? "opacity-75" : ""
              }`}
            >
              {saveStatus.saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  Save Plan
                </>
              )}
            </button>

            {saveStatus.success && (
              <span className="text-green-600 flex items-center">
                <CheckCircle size={16} className="mr-1" />
                Saved!
              </span>
            )}

            {saveStatus.error && (
              <span className="text-red-600 flex items-center">
                <AlertCircle size={16} className="mr-1" />
                Error saving
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => setCurrentView("canvas")}
                className={`px-3 py-2 rounded flex items-center ${
                  currentView === "canvas"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Layout size={16} className="mr-2" />
                Canvas View
              </button>

              <button
                onClick={() => setCurrentView("timeline")}
                className={`px-3 py-2 rounded flex items-center ${
                  currentView === "timeline"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Calendar size={16} className="mr-2" />
                Timeline View
              </button>

              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-3 py-2 rounded flex items-center ${
                  currentView === "dashboard"
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <PieChart size={16} className="mr-2" />
                Progress Dashboard
              </button>
            </div>
          </div>

          {currentView === "canvas" && (
            <div className="p-4 flex-1 overflow-y-auto">
              <h3 className="font-medium mb-3">Add Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                {elementTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => addElement(type.id)}
                    className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 flex flex-col items-center justify-center text-xs"
                    style={{ color: type.color }}
                  >
                    {type.icon}
                    <span className="mt-1">{type.name}</span>
                  </button>
                ))}
              </div>

              {plan.topics.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Topics</h3>
                  <div className="space-y-2">
                    {plan.topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => setSelectedElement(topic.id)}
                        className={`w-full px-3 py-2 text-left rounded text-sm flex items-center ${
                          selectedElement === topic.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{
                            backgroundColor: taskStatusOptions.find(
                              (o) => o.id === topic.status
                            )?.color,
                          }}
                        ></div>
                        <div className="truncate">{topic.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {currentView === "canvas" && renderCanvasView()}
          {currentView === "timeline" && renderTimelineView()}
          {currentView === "dashboard" && renderProgressDashboard()}

          {renderElementProperties()}
        </main>
      </div>

      {renderGoalModal()}
    </div>
  );
};

export default LearningPlanCreator;
