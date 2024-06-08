import { Project, IProject, projectRole, projectStatus, ToDo } from "./Projects"


export const showWarnModalForm = function(msg: string) {
    const warnModal = document.getElementById('warning-dialog')
    if ( warnModal && warnModal instanceof HTMLDialogElement) {
        warnModal.showModal()
    }
    const warnMessage = document.getElementById('warn-message')
    if ( !warnMessage ) return
    warnMessage.textContent = msg
}


 export const showWarnModalFormImportJson = function(msg: string) {
    const warnModal = document.getElementById("warning-dialog-import-json")
    if ( warnModal && warnModal instanceof HTMLDialogElement) {
        warnModal.showModal()
    }
    if ( !warnModal ) return
    const warnMessage = warnModal.querySelector('.warn-message h3')
    if ( !warnMessage ) return
    warnMessage.textContent = msg
}

export const showModalForm = function(id: string, showModal=true) {
    const modalForm = document.getElementById(id)
    if ( modalForm && modalForm instanceof HTMLDialogElement ) {
        if ( showModal ) modalForm.showModal()
        else modalForm.close()
    } else {
        console.warn(`"${id}" is not a valid CSS id, verify id is correct and in CSS`)
    }
}

export function dateFormat(date: Date) {
    // if ( date !instanceof Date ) return 'N/A'
    const options = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    };
    // console.log(date)
    return new Intl.DateTimeFormat(navigator.language, options).format(date);
}

function getProjectCard(projectId: string) {
    return document.querySelector(`[data-id="${projectId}"]`)
}


export function updateProjectDetailsContent(project:Project) {
    // this function will update the html project content after the user edits and submits the new values
    const activeProjectTitle = document.getElementById('active-project-title')
    const infoSubHeaderTitle = document.getElementById("info-sub-header-title")
    const infoSubHeaderDescription = document.getElementById("info-sub-header-description")
    const infoBodyStatus = document.getElementById("info-body-status")
    const infoBodyCost = document.getElementById("info-body-cost")
    const infoBodyRole = document.getElementById("info-body-role")
    const infoBodyFinishDate = document.getElementById("info-body-finish-date")
    const bubbleTitle = document.getElementById('info-header')?.querySelector('div p')
    const projectDetailsBubbleTitle = document.getElementById('info-header')?.querySelector('div')
    console.log(project)
    if ( !activeProjectTitle
        || !infoSubHeaderTitle
        || !infoSubHeaderDescription
        || !infoBodyStatus
        || !infoBodyCost
        || !infoBodyRole
        || !infoBodyFinishDate
        || !bubbleTitle
        || !projectDetailsBubbleTitle
        || ! project ) return
    activeProjectTitle.textContent = project.projectName
    infoSubHeaderTitle.textContent = project.projectName
    infoSubHeaderDescription.textContent = project.description
    infoBodyStatus.textContent = project.status
    infoBodyCost.value = project.cost
    infoBodyRole.textContent = project.role
    infoBodyFinishDate.textContent = project.finishDate
    bubbleTitle.textContent = project.projectName.slice(0, 2).toUpperCase()
    projectDetailsBubbleTitle.style.backgroundColor = project.iconColor
}


export function updateProjectCardContent(project: Project) {
    /*
    this function will update the project card info on the project page when a user edits and changes
    the project content on the project details page

    * @param {Project} the project object of the project card you want to update the HTML for
    * @returns {none}
    */
    const projectCard = getProjectCard(project.id)
    if ( !projectCard ) return
    // TODO: get all closest html elements and udpate their values to new ones
    const projectTitle = projectCard.querySelector('.card-title h2')
    const projectRole = projectCard.querySelector('.project-card-role')
    const projectStatus = projectCard.querySelector('.project-card-status')
    const projectImgLetters = projectCard.querySelector('h2')
    if ( !projectTitle || !projectRole || !projectStatus || !projectImgLetters ) return
    projectTitle.textContent = project.projectName
    projectRole.textContent = project.role
    projectStatus.textContent = project.status
    projectImgLetters.textContent = project.projectName.slice(0, 2).toUpperCase()

}

