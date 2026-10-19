
const supabaseClient = supabase.createClient(
    "https://onsonenexvisiqjefmgs.supabase.co",
    "sb_publishable_bNe5paetQ-kWE-eSfoUzEA_gsCajXlb"
);

function add() {
    document.getElementById("pop-up").style.display = "flex";
    document.getElementById("task-message").textContent = "";
}

function closePopup() {
    document.getElementById("pop-up").style.display = "none";
}

async function addTask() {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const message = document.getElementById("task-message");
    const button = document.getElementById("submitTask");

    if (!title) {
        message.textContent = "Please enter a task title.";
        return;
    }

    button.disabled = true;

    const { error } = await supabaseClient
        .from("tasks")
        .insert({
            title: title,
            description: description,
            status: "pending"
        });

    button.disabled = false;

    if (error) {
        message.textContent = "Error: " + error.message;
        return;
    }

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";

    closePopup();
    loadTasks();
}

async function loadTasks() {
    const container = document.getElementById("taskContainer");

    const { data, error } = await supabaseClient
        .from("tasks")
        .select("id, title, description, status")
        .order("id", { ascending: false });

    if (error) {
        container.textContent = "Error loading tasks: " + error.message;
        return;
    }

    container.innerHTML = "";

    data.forEach(function (task) {
        const card = document.createElement("div");
        card.classList.add("card");

        const title = document.createElement("h1");
        title.style.margin = "0%";
        title.textContent = task.title;

        const description = document.createElement("p");
        description.classList.add("dis-Text");
        description.style.lineHeight = "1.2";
        description.textContent = task.description || "";

        const status = document.createElement("span");
        status.classList.add(task.status === "done" ? "ptag" : "wtag");
        status.textContent = task.status === "done" ? "Done" : "Pending";

        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(status);
        card.appendChild(document.createElement("br"));

        if (task.status !== "done") {
            const doneButton = document.createElement("button");
            doneButton.classList.add("pButton");
            doneButton.style.marginRight = "8px";
            doneButton.innerHTML = '<i class="fa-solid fa-check"></i> &nbsp; Done';
            doneButton.onclick = function () {
                doneTask(task.id);
            };
            card.appendChild(doneButton);
        }

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delButton");
        deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i> &nbsp;Delete';
        deleteButton.onclick = function () {
            deleteTask(task.id);
        };

        card.appendChild(deleteButton);
        container.appendChild(card);
    });
}

async function doneTask(id) {
    const { error } = await supabaseClient
        .from("tasks")
        .update({ status: "done" })
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadTasks();
}

async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    const { error } = await supabaseClient
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) {
        alert(error.message);
        return;
    }

    loadTasks();
}

loadTasks();
