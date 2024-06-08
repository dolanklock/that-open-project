'use strict';

// --------------------- IMPORTS -------------------- //


import { Project, IProject, ToDo } from "./Projects"
import { showWarnModalFormImportJson, showModalForm, updateProjectCardContent } from "./ProjectFunctions"

// --------------------- VARIABLES -------------------- //


const projectList = document.getElementById('project-list')


// --------------------- FUNCTIONS -------------------- //


function justNumbers(string: string) {
    var numsStr = string.replace(/[^0-9]/g, '');
    return parseFloat(numsStr);
  }


// ------------------------ CLASSES ----------------------- //


export class ProjectsManager {
    // class attributes
    list: Project[] = [] // use Project[] with brackets because it says that list will be an array of type Project items
    countChange: number
    countLoad: number
    importJSONReader: FileReader
    r: string
    constructor() {
        this.countChange = 0
        this.countLoad = 0

    }

    newProject(data: IProject) {
        // check if new project has same name as existing ones
        this.list.forEach(project => {
            console.log(`EXISTING PROJECT NAME: ${project.projectName} : NEW PROPOSED NAME: ${data.projectName}`)
            if ( project.projectName === data.projectName ) {
                throw new Error(`${data.projectName}`);
            }
        })
        if ( data.projectName.length < 5 ) {
            throw new Error(`Project name must be greater than 5 characters`);
        }
        const project = new Project(data)
        this.list.push(project)
        return project
    }

    getProject(id: string) {
        const project = this.list.find(( project ) => project.id === id)
        return project
    }

    deleteProject(id: string) {
        const project = this.list.find(project => project.id === id)
        if ( !project ) return
        const updatedProjectsList = this.list.filter(project => project.id !== id)
        // assigning project list to updated list with deleted project removed
        this.list = updatedProjectsList
        // removing project card html that was deleted from html
        if ( !projectList ) return
        for ( const childElement of [...projectList.children] ) {
            // if dont have 'childElement instanceof HTMLElement' then childElement.dataset errors out
            if ( childElement instanceof HTMLElement && childElement.dataset.id === id ) {
                childElement.remove()
            }
        }
    }

    totalCostProjects() {
        if ( !projectList ) return
        const childElements = [...projectList.children]
        childElements.forEach(child => console.log(child.querySelector('.cost')))
        const projectCosts = childElements.map((childElement) => justNumbers(childElement.querySelector('.cost')?.textContent))
        const totalCost = projectCosts.reduce((totalCost, childElement) => totalCost + childElement)
        return totalCost
    }
    
    getProjectByName(name: string) {
        if ( !projectList ) return
        const projectCards = [...projectList.children]
        const project = projectCards.filter(project => name === project.querySelector('.card-title')?.querySelector('h2')?.textContent)
        return project
    }

    addToDo(projectId: string, todo: ToDo) {
        const project = this.list.find(project => project.id == projectId)
        if ( !project ) return
        project.todoList.push(todo)
    }

    editTodo(projectId: string, todoId: string, todoText: string) {
        console.log("TODO ID", todoId)
        const project = this.list.find(project => project.id == projectId)
        console.log("PROJECT", project)
        const todo = project?.todoList.find((todo) => todo.id === todoId)
        console.log("TODO", todo)
        if ( !todo ) return
        todo.text = todoText
        console.log("todo text", todo)
    }

    _overrideProjectImportJson(event: Event, project) {
        /*
        this method will take in the project object that comes from the JSON file import and set the
        project object (Project class object) and set its values the project object from JSON file
        it will then run the updateProjectCardContent function in order to update the project card content html

        * @param {Event} event - the event object from the addeventlistener method
        * @param {Object} project - the project object from the imported JSON file
        * @returns {none}
        */
        event.preventDefault()
        // event.stopPropagation()
        // console.log('**OVERRIDING EXISTING PROJECT**')
        showModalForm("warning-dialog-import-json", false)
        const projectOverride = this.list.find(p => p.projectName == project.projectName)
        if ( !projectOverride ) return
        // console.log('PROJECT OBJECT', projectOverride)
        // console.log('PROJECT JSON', project)
        projectOverride.cost = project.cost
        projectOverride.description = project.description
        projectOverride.todoList = project.todoList
        projectOverride.role = project.role
        projectOverride.status = project.status
        projectOverride.finishDate = project.finishDate
        projectOverride.iconColor = project.iconColor
        updateProjectCardContent(projectOverride)
    }

    exportProjectDataJSON(filename: string = 'projects') {
        // JSON.stringify converts JavaScript object to a json string
        const json = JSON.stringify(this.list, null, 2)
        // blob represents a file like object of immutable raw-data
        const blob = new Blob( [ json ], { type: "application/json" } );
        // URL.createObject creates a string containing a URL representing the object given in the parameter. 
        const url = URL.createObjectURL(blob)
        const exportBtn = document.getElementById('export-json') as HTMLAnchorElement
        exportBtn.click()
        if ( exportBtn && exportBtn instanceof HTMLAnchorElement ) {
            exportBtn.href = url
            // the download method will download the given link url that we set with the
            // file name we passed in
            exportBtn.download = filename // setting html button element attribute 'download' to the filename string
            // exportBtn.click()
            // URL.revokeObjectURL(url)
        }
    }

    importJSONChange(importJSONInput: HTMLInputElement) {
        // getting the selected files from the input dialog that popped up
        const fileslist = importJSONInput.files
        if ( !fileslist ) return
        // the readAsText method is used to read the contents of the passed
        // in blob or file, in this case we are passing in the file as object that we
        // selected from the input
        try {
            this.importJSONReader.readAsText(fileslist[0]) // the file will be the first item in array
            // the this.reader.readAsText will get the text from the file and when done will
            // trigger the read 'load' event above
        } catch (error) {
            console.log(`ERROR: ${error}`)
        }
    }

    importJSONLoadReader() {
        // with this.reader.result we are getting the text that was read in the event listener
        // below 'this.reader.readAsText(fileslist[0])' 
        const json = this.importJSONReader.result
        if ( !json ) return
        // here we are converting the json from the this.reader into a string
        // format using JSON.parse method and storing in projects attr
        // datatype is an array of IPorject's
        // the as string at the end is type assignment and we are telling
        // TS that this will be a string when its in the projects array
        const projects: IProject[] = JSON.parse(json as string) // json.parse converts json string into a JavaScript object
        // iterating through projects array which contains JSON items that
        // we can create a new project from using the 'newProject' method in
        // this class
        for ( const project of projects ) {
            try {
                this.newProject(project)
            } catch (error) {
                const msg = (`A project with the name "${error.message}" already exists, would you like to override it?`)
                showWarnModalFormImportJson(msg)
                const warnFormImportJson = document.getElementById('warn-form-import-json')
                const warnFormImportJsonCancelBtn = document.getElementById('cancel-warn-import-json-btn')
                if ( !warnFormImportJson || !warnFormImportJsonCancelBtn ) return

                warnFormImportJson.addEventListener('submit', (event) => this._overrideProjectImportJson(event, project))

                warnFormImportJsonCancelBtn.addEventListener('click', function(event){
                    event.stopPropagation() // need this because it will run the submit event if dont
                    warnFormImportJson.reset()
                    showModalForm("warning-dialog-import-json", false)
                }.bind(this))
            }
        }
    }

    importProjectDataJSON(event: Event) {
        // const importJSONInput = document.querySelector('.import-json')
        const importJSONInput = document.createElement("input") as HTMLInputElement
        importJSONInput.type = "file"
        importJSONInput.click()
        if (importJSONInput && importJSONInput instanceof HTMLInputElement) {
            importJSONInput.value = null // need to do this so it clears value if same path is chosen twice to import.
            // without it, if import a json then import json again the load and change eventlisteners below wont be triggered
            // getting the HTML input element
            if ( !importJSONInput ) return
            importJSONInput.accept = 'application/json' // assigning accept attr to element in html
            // this is the new FileReader object that will be used for the below code
            this.importJSONReader = new FileReader()
            // this will get triggered when we select the 'choose file' in the webpage
            importJSONInput.addEventListener('change', () => this.importJSONChange(importJSONInput))
            // * the change event handler below will be triggered first then go to this load
            // event handler once file is chosen
            // this.reader.addEventListener('click', () => this._readerCallback(this.reader))
            this.importJSONReader.addEventListener('load', () => this.importJSONLoadReader())
        }
    }

}


