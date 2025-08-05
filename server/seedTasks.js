db.tasks.insertMany([
  {
    title: "Welcome to TaskFast!",
    description: "This is your first task. Click to edit or add new tasks using the button above.",
    priority: "medium",
    completed: false,
    createdAt: new Date(),
    owner: "temp-user"
  },
  {
    title: "Learn MongoDB Integration", 
    description: "Understand how the database connects to your application",
    priority: "high",
    completed: true,
    createdAt: new Date(),
    owner: "temp-user"
  },
  {
    title: "Test Task Management",
    description: "Try creating, editing, and managing your tasks", 
    priority: "low",
    completed: false,
    createdAt: new Date(),
    owner: "temp-user"
  }
])
