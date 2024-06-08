import  *  as OBC from "openbim-components"
import { ToDoCard } from "./src/ToDoCard"
import { dateFormat } from "../../ProjectFunctions";
import * as THREE from "three"


export interface ToDo {
    description: string,
    date: Date,
    fragmentMap: OBC.FragmentIdMap,
    cameraPosition: {position: THREE.Vector3, target: THREE.Vector3}
}

export class ToDoCreator extends OBC.Component<ToDo[]> implements OBC.UI {
    enabled: true;
    static uuid: string = "4e8e4fb2-9ae9-4ec3-9550-44115a03c98d" // this is only a class attribute, will not exist on instances
    private _components: OBC.Components
    uiElement = new OBC.UIElement<{activationButton: OBC.Button, todoList: OBC.FloatingWindow}>() // with this generic
    // we are basically telling typescript that the uiElement will have these to properties
    private _list: ToDo[] = []
    constructor(components: OBC.Components) {
        super(components) // super runs the constructor method from the class we are extending from
        this._components = components
        this._components.tools.add(ToDoCreator.uuid, this)
        this.setUI()
    }
    async addToDo(description: string) {
        // need to capture the camera position at the time the user selects "create todo"
        const camera = this._components.camera
        if (!(camera instanceof OBC.OrthoPerspectiveCamera)) {
            throw new Error("ToDoCreator needs an OrthPerspectiveCamera in order to work.")
        }
        // camera.controls.addEventListener("update", async () => {
        //     console.log("*** ORBITING ***")
        //     // TODO: get the selected objects position
        //     const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        //     console.log(`**HIGHLIGHTER**: ${highlighter}`)
        //     const selectedElement = highlighter.selection
        //     console.log(`**SELECTED ELEMENT**: ${selectedElement}`)
        // })
        const positionVector = new THREE.Vector3()
        const cameraPosition = camera.controls.getPosition(positionVector)
        const targetVector = new THREE.Vector3()
        const cameraTarget = camera.controls.getTarget(targetVector)
        // getting the existing highlighter we created from the main components
        const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
        // creating todo object
        const todo: ToDo = {
            description: description,
            date: new Date(),
            fragmentMap: highlighter.selection.select, // this gets the fragmentMap from highlighter of elements selected
            cameraPosition: {position: cameraPosition, target: cameraTarget}
        }
        const todoCard = new ToDoCard(this._components)
        todoCard.onCardClick.add(() => {
            console.log("FRAG MAP LOOK INSIDE: ", todo.fragmentMap)
            highlighter.highlightByID("select", todo.fragmentMap)
            camera.controls.setLookAt(todo.cameraPosition.position.x,
                                      todo.cameraPosition.position.y,
                                      todo.cameraPosition.position.z,
                                      todo.cameraPosition.target.x,
                                      todo.cameraPosition.target.y,
                                      todo.cameraPosition.target.z,
                                      true)
        })
        todoCard.description = todo.description
        todoCard.date = todo.date
        const todoCardList = this.uiElement.get("todoList")
        todoCardList.addChild(todoCard)
        this._list.push(todo)
    }
    private setUI() {
        // ------- creating the todo form --------- //

        const form = new OBC.Modal(this._components)
        form.title = "Create Todo Note"
        this._components.ui.add(form)
        form.onCancel.add(() => {
            form.visible = !form.visible
        })
        form.onAccept.add(async () => {
            await this.addToDo(todoDescriptionInput.value)
            todoDescriptionInput.value = ""
            form.visible = false
        })
        // form input
        const todoDescriptionInput = new OBC.TextArea(this._components)
        todoDescriptionInput.label = "Description"
        // adding an obc object to another simpleUIComponent object like OBC.Modal we use slots.content.addChild()
        // slots.centent will return another simpleUIComponent
        // and the get method will return the HTML element for that simpleUIComponent. see source code for exact understanding
        // basically each UI component contains HTML that is associated with it and slots.content.get() returns that exact HTML element
        form.slots.content.addChild(todoDescriptionInput)
        form.slots.content.get().style.padding = "20px"
        form.slots.content.get().style.display = "flex"
        form.slots.content.get().style.flexDirection = "column"
        form.slots.content.get().style.rowGap = "20px"

        // ------- creating the component tools buttons --------- //

        // creating button
        const activationButton = new OBC.Button(this._components)
        activationButton.materialIcon = "construction"

        // new todo button
        const newToDoBtn = new OBC.Button(this._components, {name: "Create"})
        activationButton.addChild(newToDoBtn)
        newToDoBtn.onClick.add(async () => {
            // check to see if user has object selected in viewer before adding a todo note
            const highlighter = await this._components.tools.get(OBC.FragmentHighlighter)
            if ( Object.keys(highlighter.selection.select).length === 0 ) {
                alert("Select elements from the viewer first before making a todo note")
                return
            }
            form.visible = true
        })

        // todo list button
        const listToDoBtn = new OBC.Button(this._components, {name: "List"})
        activationButton.addChild(listToDoBtn)
        listToDoBtn.onClick.add(() => {
            todoList.visible = !todoList.visible
        })

        // ------- creating a floating window that will display todos --------- //

        //Creating floating window
        const todoList = new OBC.FloatingWindow(this._components)
        this._components.ui.add(todoList)
        todoList.visible = false
        todoList.title = "ToDo List"
        this.uiElement.set({activationButton: activationButton, todoList: todoList})
        // console.log("TESTER", this.uiElement)

    }

    get(): ToDo[] {
        return this._list
    }
    
}









































