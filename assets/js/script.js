// Initialize task list and next ID
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Generate a unique task ID
function generateTaskId() {
  return nextId++;
}

// Create a task card
function createTaskCard(task) {
  const { id, title, description, deadline, status } = task;
  const taskCard = $(`
    <div class="card task-card mb-3" data-id="${id}" data-status="${status}">
      <div class="card-body">
        <h5 class="card-title">${title}</h5>
        <p class="card-text">${description}</p>
        <p class="card-text"><strong>Deadline:</strong> ${dayjs(
          deadline
        ).format("MM-DD-YYYY")}</p>
        <button class="btn btn-danger btn-sm delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `);

  if (task.deadline && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.deadline, "MM-DD-YYYY");
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.find(".card-body").addClass("bg-danger text-white");
      taskCard.find(".delete-btn").addClass("border-light");
    }
  }

  return taskCard;
}

// Render tasks in the swim lanes
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard);
  });

  $(".task-card").draggable({
    revert: "invalid",
    cursor: "move",
    helper: "clone",
  });
}

// Handle adding a task
function handleAddTask(event) {
  event.preventDefault();

  const title = $("#title").val().trim();
  const description = $("#description").val().trim();
  const deadline = $("#deadline").val();
  const status = "todo";

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(),
      title,
      description,
      deadline,
      status,
    };

    taskList.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);

    $("#formModal").modal("hide");
    $("#title").val("");
    $("#description").val("");
    $("#deadline").val("");

    renderTaskList();
  }
}

// Handle deleting a task
function handleDeleteTask() {
  const taskId = $(this).closest(".task-card").data("id");
  taskList = taskList.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Handle dropping a task into a new lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  const newStatus = $(this).attr("id");

  const taskIndex = taskList.findIndex((task) => task.id === taskId);
  taskList[taskIndex].status = newStatus;

  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// installing
$(document).ready(function () {
  renderTaskList();

  $("#formModal").on("shown.bs.modal", function () {
    $("#title").focus();
  });

  $("#addTaskForm").on("submit", handleAddTask);

  $(document).on("click", ".delete-btn", handleDeleteTask);

  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop,
  });

  $("#deadline").datepicker({
    dateFormat: "yy-mm-dd",
  });
});
