'use strict';

// import { ThreeDViewer } from "./ArchiveThreeDViewer"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import {KeyBoardShortCutManager} from "./bim-components/KeyboardShortcuts"
import { Project, IProject, projectRole, projectStatus, ToDo } from "./Projects"
import { ProjectsManager } from "./ProjectsManager"
import { showWarnModalForm, showModalForm, updateProjectDetailsContent, updateProjectCardContent } from "./ProjectFunctions"
import {ThreeDViewer} from "./ThreeDViewer"
import * as THREE from "three"
import * as OBC from "openbim-components"
import * as BUI from "@thatopen/ui"
BUI.Manager.init()

// const b = document.querySelectorAll("bim-button") as NodeListOf<BUI.Button>
// const bimPanels = document.querySelectorAll("bim-panel") as NodeListOf<BUI.Panel>

// for (const btn of b ) {
//     btn.style.color = "white"
// }

// for (const panel of bimPanels ) {
//     panel.style.backgroundColor = "#22272e"
//     panel.style.color = "white"
//     panel.style.borderRadius = "0"
// }

// TODO: need to add button while inside bim viewer to go back to home or project info page. toggle sidebar too!


// ------------------------ VARIABLES -------------------------- //


// const projectsPage = document.getElementById('projects-page')
// const projectDetails = document.getElementById('project-details')
const projectsPage = document.querySelector('.projects-page')
const projectDetails = document.querySelector('.project-details')
const newProjectBtn = document.querySelector('.new-project-btn');
const newProjectForm = document.getElementById('new-project-form');
const newProjectDialog = document.getElementById('new-project-modal')
const newProjectSubmitBtn = document.querySelector('.form-submit-btn');
const newProjectCancelBtn = document.querySelector('.form-cancel-btn');
const todoBody = document.getElementById('todo-body')
const todoForm = document.getElementById('new-todo-form') as HTMLFormElement
const projectList = document.getElementById('project-list')
const todoFormInput = document.getElementById('todo-form-input') as HTMLInputElement
const bimViewerContainer = document.getElementById("bim-viewer") as HTMLElement
const sidebar = document.getElementById("side-bar") as HTMLElement

const projectsManager = new ProjectsManager()
const testBtn = document.getElementById('test')

const projectLandingProductsBtn = document.getElementById("project-landing-product") as HTMLButtonElement


// -------------------------- FUNCTIONS ------------------------ // 


function getProject(projectId: string | number) {
    /*

    * @param {Project} fill out
    * @returns {none}
    */
    return projectsManager.list.find(project => project.id == projectId)
}

function getProjectFormData(projectForm: HTMLFormElement) {
    /* instantiating formdata object from FormData class and passing in html form element
    this is an object that we can use to access all input values of our form using .get method

    * @param {Project} fill out
    * @returns {none}
    */
    const formData = new FormData(projectForm)
    // console.log(formData.get('project-name')); // the HTML input tag will have attribute 'name'
    // that is equal to 'project-name' and we can access it with this get method
    const date = formData.get('finish-date')
    const projectFormData: IProject = {
        // as string is type assertion and tells the TS to convert value to string (be careful with this, rarley used)
        projectName: formData.get('project-name') as string,
        description: formData.get('description') as string,
        role: formData.get('role') as projectRole,
        status: formData.get('project-status') as projectStatus,
        // here we are create a new date object from the string we get back from the form
        finishDate: date ? formData.get('finish-date') as string : 'N/A',
    }
    return projectFormData
}

function getActiveProject(): Project | undefined {
    /* this function will get the active project (js object) when the user selects a project card from the project page

    * @param {Project} fill out
    * @returns {none}
    */
    const activeProjectTitle = document.getElementById('active-project-title')?.textContent
    const project = projectsManager.list.find(project => project.projectName === activeProjectTitle)
    if ( !activeProjectTitle || !project ) return
    return project
}

function updateProjectDetailsForm(project: Project) {
    /* this function will update the form inputs to values of the project 
    editing when you click the edit button on the project

    * @param {Project} fill out
    * @returns {none}
    */
    showModalForm('new-project-modal', true)
    const projectNameInput = document.getElementById('new-project-form-project-name') as HTMLInputElement
    const projectDescriptionInput = document.getElementById('new-project-form-description') as HTMLInputElement
    const projectRoleInput = document.getElementById('new-project-form-role') as HTMLInputElement
    const projectStatusInput = document.getElementById('new-project-form-status') as HTMLInputElement
    const projectDateInput = document.getElementById('new-project-form-date') as HTMLInputElement

    if ( !projectNameInput || !projectDescriptionInput || !projectRoleInput || !projectStatusInput) return
    projectNameInput.value = project.projectName
    projectDescriptionInput.value = project.description
    projectRoleInput.value = project.role
    projectStatusInput.value = project.status
    projectDateInput.valueAsDate = new Date(project.finishDate) // TODO: figure out how to set the date to existing value
}



// --------------------- CALLBACK FUNCTIONS FOR EVENT LISTENERS--------------------- //



function newProjectFormHandler(event: Event, projectForm: HTMLFormElement) {
    /*

    * @param {Project} fill out
    * @returns {none}
    */
    event.preventDefault()
    if ( projectsPage?.classList.contains('page-hidden') ) {
        // if this block is executed then the user is editing an existing project on details page
        // update existing project data
        const projectFormData = getProjectFormData(projectForm)
        // update the project object with new values from form
        const projectObject = getActiveProject()
        if ( !projectObject ) return
        projectObject.projectName = projectFormData.projectName
        projectObject.description = projectFormData.description
        projectObject.role = projectFormData.role
        projectObject.status = projectFormData.status
        projectObject.finishDate = projectFormData.finishDate
        // update the project details page values with updated values from form
        // updateProjectDetailsForm(projectObject)
        updateProjectDetailsContent(projectObject)
        updateProjectCardContent(projectObject)
        projectForm.reset()
        showModalForm('new-project-modal', false) // closes dialog

    } else {
        // if this block is executeed then user is creating a brand new project
        const projectFormData = getProjectFormData(projectForm)
        // catching error if project name is the same as existing, error coming from projectmanager class
        // in newProject method
        try {
            const project = projectsManager.newProject(projectFormData)
            projectForm.reset()
            showModalForm('new-project-modal', false) // closes dialog
        } catch (error) {
            showWarnModalForm(`A project with the name "${error.message}" already exists.`)
        }
    }
}

export function projectCardClicked(event: Event) {
    /*

    * @param {Project} fill out
    * @returns {none}
    */
    const projectCard = ( event.target as HTMLElement).closest('.project-card') as HTMLElement
    if ( !projectCard ) return
    const projectCardId = projectCard.dataset.id as string
    const project = getProject(projectCardId)
    if ( !project ) return
    updateProjectDetailsContent(project)
    renderToDoList(project)
    projectDetails!.classList.toggle("page-hidden")
    projectsPage!.classList.toggle("page-hidden")
}

export function bimViewerProjectCardClicked(projectCard: HTMLElement) {
    /*

    * @param {Project} fill out
    * @returns {none}
    */
    if ( !projectCard ) return
    const projectCardId = projectCard.dataset.id as string
    const project = getProject(projectCardId)
    if ( !project ) return
    updateProjectDetailsContent(project)
    renderToDoList(project)
    projectDetails!.classList.toggle("page-hidden")
    bimViewerContainer.classList.toggle("page-hidden")
    // sidebar.classList.toggle("page-hidden")
}

function editProjectCard(event: Event) {
    /*

    * @param {Project} fill out
    * @returns {none}
    */
    showModalForm('new-project-modal', true)
    const project = getActiveProject()
    if ( !project ) return
    updateProjectDetailsForm(project)
}

function projectsClicked(event: Event) {
    /*
    * @param {Project} fill out
    * @returns {none}
    */
    if ( !projectsPage ) return
    if (!(bimViewerContainer.classList.contains("page-hidden"))) {
        bimViewerContainer.classList.toggle("page-hidden")
    }
    if (!(projectDetails!.classList.contains("page-hidden"))) {
        projectDetails!.classList.toggle("page-hidden")
    }
    if (projectsPage.classList.contains("page-hidden")) {
        resetActiveProject()
        projectsPage.classList.toggle("page-hidden")
    }
}

function addToDoHandler(event: Event) {
    /*
    when todo form is submitted this function will run and get valie from input and
    add todo to the html and add the todo to the project objects todolist

    * @param {Project} project - the project object to use for rendering the todos. The project passed in will be
                        the data values for the HTML rendered
    * @returns {none}
    */
    event.preventDefault()
    // if ( !todoFormInput ) return
    // else todoFormInput.value = ""
    const project = getActiveProject()
    if ( !project || !todoForm ) return
    const todoFormData = new FormData(todoForm as HTMLFormElement)
    let text = todoFormData.get('todo-text')
    if ( !text ) {
        todoForm.reset()
        showModalForm('new-todo-modal', false) // closes dialog
    }
    projectsManager.addToDo(project.id, new ToDo(text as string))
    renderToDoList(project)
    todoForm.reset()
    showModalForm('new-todo-modal', false) // closes dialog
    renderToDoStatusColor(project)
}

function editTodoHandler(event: Event) {
    /*
    when todo edit button is clicked and then the form is submitted this event handler
    will be triggered and update the project object todo object text and then render the updated
    todo html by running renderTodoList

    * @param {Project} project - the project object to use for rendering the todos. The project passed in will be
                        the data values for the HTML rendered
    * @returns {none}
    */
    event.preventDefault()
    // GETTING EXISTING TODO TEXT AND SETTING FORM DEFAULT VALUE
    const todo = clickedEditToDo.closest('.todo')
    const todoExistingText = todo?.querySelector(".todo-text")
    // if ( !todoFormInput ) return
    // todoFormInput.value = todoExistingText
    if ( !todo ) return
    const project = getActiveProject()
    if ( !project || !todoForm ) return
    const todoFormData = new FormData(todoForm as HTMLFormElement)
    let text = todoFormData.get('todo-text') as string
    if ( !text ) {
        todoForm.reset()
        showModalForm('new-todo-modal', false) // closes dialog
    }
    // GET THE EDITING TODO'S ID AND PASS INTO FUNCTION projectManager.editTodo
    projectsManager.editTodo(project.id, todo.dataset.id, text)
    renderToDoList(project)
    todoForm.reset()
    showModalForm('new-todo-modal', false) // closes dialog
    renderToDoStatusColor(project)
}

function renderToDoList(project: Project) {
    /*
    this function clears the HTML inside of the todo-body HTML and updates the HTML inside of the todo-body
    with the given project object todo list. then after it adds the todo HTML, it will run the renderToDoStatusColor
    function in order to get the todo HTML to the correct color and status

    * @param {Project} project - the project object to use for rendering the todos. The project passed in will be
                        the data values for the HTML rendered
    * @returns {none}
    */
    if ( !todoBody ) return
    todoBody.innerHTML = ""
    project.todoList.forEach(todo => {
        const htmlToDo = 
                        `<div class="todo" data-id="${todo.id}">
                            <span class="material-icons-round">construction</span>
                            <p class="todo-text">${todo.text}</p>
                            <div class="todo-status-date">
                                <div class="select-edit">
                                    <select name="todo-status" id="todo-status" class="todo-status">
                                        <option value="open">Open</option>
                                        <option value="in-progress">In-progress</option>
                                        <option value="complete">Complete</option>
                                    </select>
                                    <span class="material-symbols-outlined todo-edit">edit_note</span>
                                </div>
                                <p class="todo-date">Created on: ${todo.dateCreated}</p>
                            </div>
                        </div>`
        todoBody.insertAdjacentHTML('afterbegin', htmlToDo)
    })
    renderToDoStatusColor(project)
}

function renderToDoStatusColor(project: Project) {
    /*
    this function will iterate through the given project objects todos and find the todo HTML from the given
    todo object, then it will assign the todo HTML status to the todo objects status (this will update the
    dropdown selector) and then it will update the todo HTML background color based on the todo objects status value

    * @param {Project} project - the project object to use for updating the todo HTML - whatever project passed
                        in, that will be the todo html that is updated because the project objects todo objects id
                        will be used to find the todo HTML (by id)
    * @returns {none}
    */
    project.todoList.forEach(todo => {
        const todoHTMLElement = document.querySelector(`[data-id="${todo.id}"]`)
        const todoStatus = todoHTMLElement?.querySelector('.todo-status')
        todoStatus.value = todo.status
        if ( !todoHTMLElement || !todoStatus ) return
        if ( todo.status === 'open' ) todoHTMLElement.style.background = "red"
        if ( todo.status === 'in-progress' ) todoHTMLElement.style.background = "blue"
        if ( todo.status === 'complete' ) todoHTMLElement.style.background = "green"
    })

}

function updateProjectToDoStatus(elementIdFind: string, status: string) {
    /*
    this function will get the current active project object (Project) and find the 
    todo object from its todoList from the elementIdFind passed in and update the todo objects
    status attribute with the status passed into arg

    * @param {string} elementIdFind - the id of the todo object to find in the project objects todoList list
    * @param {string} status - the current status of the todo object
    * @returns {none}
    */
    const project = getActiveProject()
    const projectToDo = project?.todoList.find(todo => todo.id === elementIdFind)
    if ( !projectToDo ) return
    projectToDo.status = status
}

function todoStatusChangeEventHandler(event: Event) {
    /*
    this function will update the color of the todo background when the status is changed

    * @param {Event} event - the event object from the addeventlistener method
    * @returns {none}
    */
    event.preventDefault()
    const selectElement = event.target as HTMLSelectElement
    const todoHTMLElement = (event.target as HTMLElement).closest('.todo') as HTMLElement
    if ( !todoHTMLElement || !selectElement ) return
    const id = todoHTMLElement.dataset.id as string
    updateProjectToDoStatus(id, selectElement.value)
    renderToDoStatusColor(getActiveProject() as Project)
}

function getActiveProjectCard(): HTMLElement {
    const allProjectCards = document.querySelectorAll(".project-card") as NodeListOf<HTMLElement>
    const activeProjectCard = Array.from(allProjectCards).find((projectCard) => {
        return projectCard.classList.contains("active")
    })
    console.log('FOUND PROJECT CARD', activeProjectCard)
    return activeProjectCard!
}

function resetActiveProject() {
    getActiveProjectCard().classList.remove("active")
}




// --------------------------- EVENT HANDLER ---------------------------- //


// new project button is clicked, will open dialog
if ( newProjectBtn ) {
    newProjectBtn.addEventListener('click', () => showModalForm('new-project-modal', true))
}


// if cancel button is clicked in new project dialog
if ( newProjectCancelBtn ) {
    newProjectCancelBtn.addEventListener('click', () => showModalForm('new-project-modal', false))
}

// creating a new project
if ( newProjectForm && newProjectForm instanceof HTMLFormElement ) {
    newProjectForm.addEventListener('submit', (event) => newProjectFormHandler(event, newProjectForm))
}


// ** FOR TESTING ONLY ** //

if ( testBtn ) {
    testBtn.addEventListener('click', (event) => {
        event.preventDefault()
        const viewerHTML = document.getElementById("viewer")
        viewerHTML!.requestFullscreen()
        // projectsManager.importJSONReader = undefined
        // projectsManager.reader.removeEventListener('load', projectsManager.importJSONLoadReader)
        // console.log(projectsManager.importJSONReader)
    })
}

// ** FOR TESTING ONLY ** //


// for closing the warnModal that opens in the new project dialog if project names are the same
document.getElementById('warn-form')?.addEventListener('click', (event) => {
    const warnModal = document.getElementById('warning-dialog')
    if ( warnModal && warnModal instanceof HTMLDialogElement ) warnModal.close()
})

const exportJSONBtn = document.querySelector('.export-json')
if (exportJSONBtn) {
    exportJSONBtn.addEventListener('click', () => projectsManager.exportProjectDataJSON())
}

const importJSONBtn = document.querySelector('.import-json')
if (importJSONBtn) {
    importJSONBtn.addEventListener("click", (event) => {
        console.log("import clicked")
        projectsManager.importProjectDataJSON(event)
    })
}

if (projectList) {
    // using event delegation here for 3d bim viewer and delete buttons in project card
    projectList.addEventListener('click', (event) => {
        const clickedElement = event.target as HTMLElement
        if ( !clickedElement ) return
        const card = clickedElement.closest(".project-card") as HTMLElement
        if (!card) return
        const projectCardId = card.dataset.id as string
        if ( clickedElement.classList.contains('delete-project')) {
            // if ( !card ) return
            if ( card && card instanceof HTMLElement ) {
                if ( !projectCardId ) return
                projectsManager.deleteProject(projectCardId)
            }
        } else if (clickedElement.classList.contains("bim-viewer-btn")) {
            card.classList.toggle("active")
            bimViewerContainer.classList.toggle("page-hidden")
            // sidebar.classList.toggle("page-hidden")
            projectsPage!.classList.toggle("page-hidden")

        } else {
            card.classList.toggle("active")
            projectCardClicked(event)
        }
    })
}

// Projects button on sidebar clicked
const sidebarProjectsBtn = document.getElementById('sidebar-projects-btn')
if ( sidebarProjectsBtn ) {
    sidebarProjectsBtn.addEventListener('click', (event) => projectsClicked(event))
}

const editProjectDetails =  document.getElementById('info-header-edit')
if ( editProjectDetails ) {
    editProjectDetails.addEventListener('click', (event) => editProjectCard(event))
}


// ------------------------ BIM viewer Event Listeners ------------------------------ #

const bimViewerExitBtn = document.getElementById("bim-viewer-project-details") as HTMLElement
bimViewerExitBtn.addEventListener("click", () => {
    const activeProjectCard = getActiveProjectCard() as HTMLElement
    bimViewerProjectCardClicked(activeProjectCard)
})

const bimViewerHomeBtn = document.getElementById("bim-viewer-home") as HTMLElement
bimViewerHomeBtn.addEventListener("click", () => {
    projectsPage?.classList.toggle("page-hidden")
    // sidebar.classList.toggle("page-hidden")
    bimViewerContainer.classList.toggle("page-hidden")
    resetActiveProject()
})


// ------------------------ Project Landing Page Event Listeners ------------------------------ #

const projectLanding = document.getElementById("project-landing") as HTMLDivElement
projectLandingProductsBtn.addEventListener("click", () => {
    projectLanding.classList.toggle("page-hidden")
    projectsPage!.classList.toggle("page-hidden")
    sidebar.classList.toggle("page-hidden")

})

// ------------------------ SIDEBAR Event Listeners ------------------------------ #

const expandBtn = document.querySelector(".bx-menu") as HTMLElement
const allSideBarTitlesHTMLElement = document.querySelectorAll(".side-bar-titles") as NodeListOf<HTMLElement>
const scriptsListHTMLElement = document.querySelector(".scripts-list") as HTMLElement
expandBtn.onclick = function() {
    sidebar.classList.toggle("active")
    if (sidebar.classList.contains("active")) {
        sidebar.style.width = "350px"
        allSideBarTitlesHTMLElement.forEach((titleElement) => {
            titleElement.classList.remove("hide")
        })
        scriptsListHTMLElement.classList.remove("hide")
        return
    }
    allSideBarTitlesHTMLElement.forEach((titleElement) => {
        titleElement.classList.add("hide")
    })
    scriptsListHTMLElement.classList.add("hide")
    sidebar.style.width = "50px"
}


// ------------------------ todo Event Listeners ------------------------------ #


let editingTodo = false
let clickedEditToDo: HTMLSpanElement

// if add todo button is clicked will open dialog
const addToDo = document.getElementById('add-todo')
if ( addToDo ) {
    addToDo.addEventListener('click', (event) => {
        editingTodo = false
        showModalForm('new-todo-modal', true)
    })
}

if ( todoForm ) {
    todoForm.addEventListener('submit', (event) => {
        console.log('EDITING TODO STATUS', editingTodo)
        if ( !editingTodo ) {
            addToDoHandler(event)
        } else {
            // event.preventDefault()
            editTodoHandler(event)
        }
    })
}

// this closes the todo form dialog if cancel is clicked
if ( todoForm ) {
    todoForm.addEventListener('click', (event) => {
        const target = event.target as HTMLElement
        if ( target.classList.contains('form-cancel-btn') ) {
            todoForm.reset()
            showModalForm('new-todo-modal', false) // closes dialog
        }
    })
}

if ( todoBody ) {
    todoBody.addEventListener('change', (event) => todoStatusChangeEventHandler(event))
    todoBody.addEventListener('click', (event) => {
        clickedEditToDo = event.target as HTMLElement
        if ( !clickedEditToDo || clickedEditToDo.nodeName !== "SPAN" ) return
        editingTodo = true
        // SETTING FORM INPUT DEFAULT VALUE TO EXISTING TODO TEXT
        const todo = clickedEditToDo.closest('.todo') as HTMLElement
        const todoExistingText = todo.querySelector(".todo-text")!.textContent as string
        if ( !todoFormInput ) return
        todoFormInput.value = todoExistingText
        showModalForm('new-todo-modal', true)
    })
}


ThreeDViewer()


// const keyBoardShortcutManager = new KeyBoardShortCutManager()

// function printSomething() {
//     console.log("** ran keyboard shortcut ****")
// }

// keyBoardShortcutManager.addCommand("Print Statement", "p", printSomething)

// console.log(keyBoardShortcutManager.getCommands())
// console.log(keyBoardShortcutManager.getCommand("p"))
// ------------------------------------- TODO LIST --------------------------------------- //


// TODO: issue with bottom of contents not moving when drag window, id with "project-details" is
// changing with window change in height but the nested divs are not... cant use the column direction and flex-grow i dont think...


// TODO: create an icon at bottom of window similar to ifc loader one using OBC

// TODO: add option to sort todos by complete or by date created 

// TODO: when compied components from master files from Series 1 into project starts messing with
// other html and the behavior of it. lots of space to right side of viewer for some reason.
// viewer now flex's properly, why? left title block will change width, why?


// TODO: FINAL CONCLUSION IT IS THE PARENT CSS THAT IS MESSING WITH 3D VIEWER CHANGING SIZE RAPIDLY "proj-details-header"
// NEED TO FIND ANOTHER WAY TO STYLE PROJECT-DETAILS SHEET WITH CSS


/*

// TODO: add ability for UI input of cost and estimated progress and then update the progress
// bar to move when percentage is changed

// TODO: update todo UI to have same dialog as good one

// TODO: when importing projects the color between the project page and the actual proejct card detail
// page when click on card - the project image color is different between the two, make sure
// background color is same everywhere

// TODO: when import projects need it so if more then  one project with same name will confirm to override
// each proejct that is same.. right now even if there is two with same name it will only prompt the one

// TODO: update override project dialog to look nicer

// TODO: add confirmation for when delete is clicked on projectcard

// TODO: fix scrolling of todos - when add too many todos it makes page height bigger, should add scroll bar

// TODO: should have input for cost and estimated progress ??

// TODO: add delete button for todos??

// TODO: add date to todo html

// TODO: update error handler in projectsmanager class in that module in the importjson method

*/