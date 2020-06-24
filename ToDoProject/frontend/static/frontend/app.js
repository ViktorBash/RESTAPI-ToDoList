/*
			KEY COMPONENTS:
			"activeItem" = null until an edit button is clicked. Will contain object of item we are editing
			"list_snapshot" = Will contain previous state of list. Used for removing extra rows on list update

			PROCESS:
			1 - Fetch Data and build rows "buildList()"
			2 - Create Item on form submit
			3 - Edit Item click - Prefill form and change submit URL
			4 - Delete Item - Send item id to delete URL
			5 - Cross out completed task - Event handle updated item

			NOTES:
			-- Add event handlers to "edit", "delete", "title"
			-- Render with strike through items completed
			-- Remove extra data on re-render
			-- CSRF Token
*/

// From Django. Creates CSRF token so we can send it with our POST requests later on
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
var csrftoken = getCookie('csrftoken');
var activeItem = null
var list_snapshot = []

// Will call data from the API and put it into the HTMl wrapper
function buildList() {
    let wrapper = document.querySelector("#list-wrapper")
    // wrapper.innerHTML = "" // Clear wrapper incase there is already something there, since we refresh whole list





    let url = 'http://localhost:8000/api/task-list/'

    fetch(url)
        .then((resp) => resp.json())
        .then(function(data) {
            console.log('Data: ', data);

            let list = data;
            for (let i in list) {

                try {
                    document.getElementById(`#data-row-${i}`).remove()

                }
                catch(err) {

                }

                var title = `<span class="title">${list[i].title}</span>`
                if (list[i].completed === true) {
                    title = `<strike class="title">${list[i].title}</strike>`
                }

                let item = `
                    <div id="data-row-${i}" class="task-wrapper flex-wrapper">
                        <div style="flex: 7">
                        ${title}
                        </div>
                        <div style="flex: 1">
                        <button class="btn btn-sm btn-outline-info edit">Edit</button>
                        </div>
                        <div style="flex: 1">
                        <button class="btn btn-sm btn-outline-dark delete">-</button>
                        </div>
                    </div>
                `

                wrapper.innerHTML += item;
            }

            if (list_snapshot.length > list.length){
                for(var i = list.length; i < list_snapshot.length; i++) {
                    document.getElementById(`#data-row-${i}`).remove()

                }
            }
            list_snapshot = list

            // To add event listener to edit and delete button
            for (let i in list) {
                var editBtn = document.getElementsByClassName("edit")[i]
                var deleteBtn = document.getElementsByClassName("delete")[i]
                var title = document.getElementsByClassName('title')[i]

                editBtn.addEventListener('click', (function(item){
                    return function(){
                        editItem(item)
                    }
                })(list[i]))

                deleteBtn.addEventListener('click', (function(item){
                    return function(){
                        deleteItem(item)
                    }
                })(list[i]))

                title.addEventListener('click', (function(item){
                    return function(){
                        strikeUnstrike(item)
                    }
                })(list[i]))

            }

        })
}

var form = document.querySelector("#form-wrapper");
form.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submitted')
    let url = 'http://localhost:8000/api/task-create/'

    // If we are editing instead of creating, change the URL for the JSON object we send.
    if(activeItem !== null) {
        url = `http://localhost:8000/api/task-update/${activeItem.id}/`
        activeItem = null;
    }
    let title = document.querySelector("#title").value;


    fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'X-CSRFToken': csrftoken,
        },
        body: JSON.stringify({'title':title})
        }

    ).then(function(response){
        buildList();
    })

    document.querySelector("#title").value = "";
})

function editItem(item) {
    console.log("Item clicked ", item)
    // When we edit item we want to put it into the submit bar at the top, and set activeItem to the item we are
    // editing so that we know we are doing an edit and now creating a new item.
    activeItem = item
    document.querySelector("#title").value = activeItem.title;
}

function deleteItem(item) {
    console.log("Delete clicked", item)

    fetch(`http://localhost:8000/api/task-delete/${item.id}/`, {
        method:"DELETE",
        headers:{
            "Content-type":"application/json",
            "X-CSRFToken":csrftoken,
        }
    }).then((response) => {
        buildList()
    })
}

function strikeUnstrike(item) {
    console.log("Strike clicked")
    item.completed = !item.completed;
    fetch(`http://localhost:8000/api/task-update/${item.id}/`, {
        method:"POST",
        headers:{
            "Content-type":"application/json",
            "X-CSRFToken":csrftoken,
        },
        body:JSON.stringify({'title':item.title, 'completed':item.completed})
    }).then((response) => {
        buildList()
    })
}

buildList();
