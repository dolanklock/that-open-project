
// ------------------- importing three.js -------------------- //

import * as THREE from "three"
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import * as OBC from "openbim-components"
import { Fragment, IfcProperties } from "bim-fragment"
import { FragmentsGroup } from "bim-fragment"
import { ToDoCreator } from "./bim-components/ToDoCreator"
import { KeyBoardShortCutManager } from "./bim-components/KeyboardShortcuts"
import { AIRenderer } from "./bim-components/AIRenderer"
import { showModalForm } from "./ProjectFunctions"
// import 'dotenv/config'
// import dotenv from 'dotenv';
// dotenv.config()
// import dotenv from "dotenv";
// dotenv.config();
// require('dotenv').config()
// ------------------------ 3D Viewer setup --------------------------- //


export function ThreeDViewer() {
    // can use OBC components library to do what we did above but simplified
// creating the viewer component
const viewer = new OBC.Components()

// creating the scene component
const sceneComponent = new OBC.SimpleScene(viewer)
viewer.scene = sceneComponent
sceneComponent.setup() // applies directional light etc.. refer to source code
// by holding alt and clicking the 'get()' method and then at the top selecting index-d.ts and selecting
// the index.js file

// can get the threejs scene by doing the following
const scene = sceneComponent.get()

// setting up the renderer
const viewerContainer = document.getElementById("viewer") as HTMLDivElement
const rendererComponent = new OBC.PostproductionRenderer(viewer, viewerContainer)
viewer.renderer = rendererComponent

// setting up camera component
const cameraComponent = new OBC.OrthoPerspectiveCamera(viewer)
viewer.camera = cameraComponent

// setting up the raycaster component
const raycasterComponent = new OBC.SimpleRaycaster(viewer)
viewer.raycaster = raycasterComponent

// need to call the viewer.init() method after we have setup the scene the renderer and the camera..
viewer.init()
cameraComponent.updateAspect()
rendererComponent.postproduction.enabled = true // need to call this after viewer.init()

// -------------------------------- Toolbar Setup --------------------------------- //

const toolbar = new OBC.Toolbar(viewer)
viewer.ui.addToolbar(toolbar)

// ------------------------ Fragments manager --------------------------- //

const fragmentManager = new OBC.FragmentManager(viewer)
toolbar.addChild(fragmentManager.uiElement.get("main"))

// ------------------------ IFC Loader Setup/Config --------------------------- //

const ifcLoader = new OBC.FragmentIfcLoader(viewer)
// need to do the below because ifc module from open BIM components needs additional files for loading and working with ifc's
ifcLoader.settings.wasm = {
    path: "https://unpkg.com/web-ifc@0.0.53/",
    absolute: true
}
toolbar.addChild(ifcLoader.uiElement.get("main"))

// -------------------------------- Buttons --------------------------------- //

const fullScreenBtn = new OBC.Button(viewer);
fullScreenBtn.materialIcon = "info";
fullScreenBtn.tooltip = "Full screen";
fullScreenBtn.onClick.add(() => {
    const viewerHTML = document.getElementById("viewer")
    if ( !viewerHTML ) return
    viewerHTML.requestFullscreen()
});
toolbar.addChild(fullScreenBtn);

const exitFullScreenBtn = new OBC.Button(viewer);
exitFullScreenBtn.materialIcon = "handshake";
exitFullScreenBtn.tooltip = "Exit full screen";
exitFullScreenBtn.onClick.add(() => {
    document.exitFullscreen()
});
toolbar.addChild(exitFullScreenBtn);

const classificationWindowOpenBtn = new OBC.Button(viewer)
classificationWindowOpenBtn.materialIcon = "open_in_new"
classificationWindowOpenBtn.tooltip = "Classification Window"
classificationWindowOpenBtn.onClick.add(() => {
    classificationWindow.visible = !classificationWindow.visible
    classificationWindow.active = classificationWindow.visible
})
toolbar.addChild(classificationWindowOpenBtn)

const importFragmentBtn = new OBC.Button(viewer)
importFragmentBtn.materialIcon = "upload"
importFragmentBtn.tooltip = "Import Fragment Group"
toolbar.addChild(importFragmentBtn)

// -------------------------------- Fragments Highlighter --------------------------------- //

const highlighter = new OBC.FragmentHighlighter(viewer)
highlighter.setup()

// -------------------------------- Fragments Classifier --------------------------------- //

// LETS US GROUP ELEMENTS, FROM THE FRAGEMENT GROUPS OBJECT
const classifier = new OBC.FragmentClassifier(viewer)

// -------------------------------- Classification Window UI --------------------------------- //

const classificationWindow = new OBC.FloatingWindow(viewer)
viewer.ui.add(classificationWindow)
classificationWindow.description = "Building Components"
classificationWindow.title = "Main Window"
classificationWindow.visible = false

// -------------------------------- IFC properties processor --------------------------------- //

const ifcPropertiesProcessor = new OBC.IfcPropertiesProcessor(viewer)
toolbar.addChild(ifcPropertiesProcessor.uiElement.get("main"))

// ------------------------------- Culler --------------------------------- //

const culler = new OBC.ScreenCuller(viewer)
culler.setup()

// -------------------------------- ToDoCreator --------------------------------- //

const todoCreator = new ToDoCreator(viewer)
toolbar.addChild(todoCreator.uiElement.get("activationButton"))

// -------------------------------- keyboard shortcut manager --------------------------------- //

function printSomethingOne() {
    console.log("** one ****")
}

function printSomethingTwo() {
    console.log("** two ****")
}

function openToDoList() {
    todoCreator.uiElement.get("todoList").visible = !todoCreator.uiElement.get("todoList").visible
}

function newProject() {
    showModalForm('new-project-modal', true)
}

const keyboardShortcutManager = new KeyBoardShortCutManager(viewer)
toolbar.addChild(keyboardShortcutManager.uiElement.get("activationBtn"))

keyboardShortcutManager.addCommand("Print One Console", "one", printSomethingOne)
keyboardShortcutManager.addCommand("Print Two Console", "two", printSomethingTwo)
keyboardShortcutManager.addCommand("Open ToDo List", "tdl", openToDoList)
keyboardShortcutManager.addCommand("Create New Project", "np", newProject)

console.log(keyboardShortcutManager.isDisposeable())
const testBtn = new OBC.Button(viewer)
toolbar.addChild(testBtn)
testBtn.onClick.add(() => {
    keyboardShortcutManager.dispose()
})


// -------------------------------- AI render tool --------------------------------- //

// TODO: setup API key - refer to youtube video https://www.youtube.com/watch?v=17UVejOw3zA&list=LL&index=10

// TODO: why is render quality so bad???? - try with IFC export of revit sample model

// TODO: change spinner to be an OBC.Spinner object, then us spinner.visible = true, etc to use

// TODO: make so that when render is complete it shows a sample of the render and then asks the user if they want to discard or save the image
// if discard it will not save the image and close the window, if save, of course will save the render

// TODO: give hint to good prompts in the prompt dialog, (research what a good prompt looks like)

const APIKey = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"

// require('dotenv').config()
// console.log("API KEY HERE FROM ENV", process.env)


// dotenv.config();
// console.log("API KEY HERE FROM ENV", process.env.API_KEY); // or any specific key

const processURL = "https://modelslab.com/api/v6/realtime/img2img";
const proxyURL = "https://cors-anywhere.herokuapp.com/"; // Avoids CORS locally
const uploadURL = "https://modelslab.com/api/v3/base64_crop";

const aiRenderer = new AIRenderer(viewer, APIKey, proxyURL, uploadURL, processURL)
// aiRenderer._setUI()
const ribbon = document.getElementById("bim-toolbar-ai")
console.log(aiRenderer.uiElement.get("RibbonUIComponent").get())
ribbon!.insertAdjacentElement("beforeend", aiRenderer.uiElement.get("RibbonUIComponent").get())



// ----------- TESTING PROMISES ----------- //


async function test() {
    const newPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("done")
            return resolve("worked")
        }, 3000);
    })
    return newPromise
}

async function test2() {
    console.log("ran first")
    const res = await test()
    // console.log(res)
    console.log("ran second")
}

test2()


// ----------- TESTING PROMISES ----------- //



// let keys = {}
// document.addEventListener("keyup", (e: KeyboardEvent) => {
//     keys[e.key] = true
//     console.log(keys, Object.keys(keys).join(""))
//     if (Object.keys(keys).join("") === "as") {
//         console.log("CLICKED 'AS'")
//     }
// })

// let keys1: string[] = []
// const shortcut = "eod"
// document.addEventListener("keypress", (e: KeyboardEvent) => {
//     const keyPressed = e.key
//     keys1.push(keyPressed)
//     const keysTrimmed = keys1.slice(-shortcut.length)
//     console.log(keysTrimmed)
//     if (keysTrimmed.join("").toLowerCase() === shortcut.toLowerCase()) {
//         console.log("shortcut keys activated")
//     }
// })


// -------------------------------- Event Handlers ---------------------------------- //

const loadIFCBtn = document.getElementById("load-ifc")
loadIFCBtn!.addEventListener("click", () => {
    ifcLoader.uiElement.get("main").get().click()
})

const importIFC = document.getElementById("import-ifc")
importIFC!.addEventListener("click", () => {
    importFragmentBtn.domElement.click()
})

// OBC has built in event handlers. this one will get triggered when ifc is loaded
ifcLoader.onIfcLoaded.add((model) => {
    exportFragments(model)
    exportProperties(model)
    viewerUIOnLoaded(model)
})

highlighter.events.select.onClear.add(() => {
    ifcPropertiesProcessor.cleanPropertiesList()
})

importFragmentBtn.onClick.add(() => {
    importFragments()
})

fragmentManager.onFragmentsLoaded.add((model) => {
    console.log("model fragment loader", model)
    importProperties(model)
})

// ----------------------------   TESTING -------------------------------- //

// let coords: number = 0
// const geometryCube = new THREE.BoxGeometry(50, 50, 50, 50, 50, 50)
// const materialCube = new THREE.MeshStandardMaterial()

// const testMesh = new THREE.Mesh(geometryCube, materialCube)
// testMesh.position.set(coords, coords, coords);
// scene.add(testMesh)

// const testButton = new OBC.Button(viewer)
// testButton.onClick.add(() => {
//     coords += 30
//     testMesh.position.set(coords, coords, coords)
// })
// toolbar.addChild(testButton)

//TODO: i think i need to try and get all geometries from BufferGeometry, right now they all all as array ints and i need them
// as three js geometries just like the testMesh above so i can simply get their positions

// cameraComponent.controls.addEventListener("update", async () => {
//     console.log("*** ORBITING ***")
//     console.log(viewer)
//     // testMesh.position.set(30, 30, 30)
//     cameraComponent.controls.setOrbitPoint(coords, coords, coords)
//     // console.log("TEST POSITION", testMesh.position)
//     // console.log("TEST POSITION", testMesh)
//     // TODO: get the selected objects position
//     // const highlighter = await viewer.tools.get(OBC.FragmentHighlighter)
//     // console.log("selectedelement")
//     const selectedElement = highlighter.selection.select
//     for (const fragID in selectedElement) {
//         const fragment = fragmentManager.list[fragID];
//         console.log("FRAGMENT!!**", fragment)
//         console.log("FRAGMENT POSITION", fragment.mesh.geometry.getAttribute("position"))
//         // console.log(fragment.fragments)
//         // console.log(fragment.fragments.select)
//         // const g = fragment.fragments.select.mesh.getVertexPosition()
//         // console.log("GEOMETRY", g)
//         // const position = g.attributes.position;
//         // const x = position.getX(1);
//         // const y = position.getY(1);
//         // const z = position.getZ(1);
//         // console.log(x, y, z);
//         // cameraComponent.controls.setOrbitPoint(0, 0, 0)
//         // cameraComponent.controls.setLookAt(10,10,10,0,0,0,true)
//         // const frag = fragment.fragments.select
//         // const t = new THREE.Vector3()
//         // const pos = frag.mesh.getWorldPosition(t)
//         // console.log("POSITIONS")
//         // console.log(t)
//         // console.log(pos)
//     }
  
// })

// ----------------------------   TESTING ----------------------------- //


// ---------------------------- Functions ------------------------------- //


async function createModelTree(): Promise<OBC.SimpleUIComponent> {
    // fragment tree will create a UI for the groups based on the classifier
    const fragmentTree = new OBC.FragmentTree(viewer)
    console.log("FRAGMENT TREE", fragmentTree)
    fragmentTree.init()
    await fragmentTree.update(['model', 'storeys', 'entities'])
    fragmentTree.onHovered.add((fragmentMap) => {
        highlighter.highlightByID("hover", fragmentMap.items)
    })
    fragmentTree.onSelected.add((fragmentMap) => {
        highlighter.highlightByID("select", fragmentMap.items)
    })
    const tree = fragmentTree.get().uiElement.get("tree") // gets the html element for the fragment tree
    return tree
}
 // updated method here model.properties > model.getLocalProperties()
function exportProperties(model: FragmentsGroup) {
    const localProperties = model.getLocalProperties()
    let properties = JSON.parse(JSON.stringify(localProperties, null, 2))
    properties.modelName = model.name
    const propertiesJSON = JSON.stringify(properties, null, 2)
    // blob represents a file like object of immutable raw-data
    const blob = new Blob( [ propertiesJSON ], { type: "application/json" } );
    // URL.createObject creates a string containing a URL representing the object given in the parameter. 
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    console.log("NAME TEST DOWNLOAD json", model.ifcMetadata.name)
    console.log("model data", model.getLocalProperties())
    // a.download = `${model.ifcMetadata.name.replace(".ifc", "")}` // downloaded file name
    a.download = `${model.ifcMetadata.name}.json` // downloaded file name
    a.click()
    URL.revokeObjectURL(url)
}

function importProperties(model: FragmentsGroup) {
    // creating an anonymous input
    const input = document.createElement('input')
    input.type = "file"
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
        console.log('running import properties load')
        const json = reader.result
        if ( !json ) {return}
        const properties = JSON.parse(json as string)
        if (properties.modelName !== model.name) {
            alert("JSON properties file selected does not match the fragment group. Please select the matching file or load a new model\
            which will generate new matching pairs.")
            fragmentManager.reset()
            return
        }
         // updated method here model.properties > model.getLocalProperties()
        model.setLocalProperties(properties)
        viewerUIOnLoaded(model)
    })
    input.addEventListener("change", () => {
        const filesList = input.files
        if ( !filesList ) {return}
        reader.readAsText(filesList[0])
    })
    input.click() // when we click the importFragmentBtn it clicks the input
}   

function exportFragments(model: FragmentsGroup) {
    const fragmentBinary = fragmentManager.export(model)
    // blob represents a file like object of immutable raw-data
    const blob = new Blob([ fragmentBinary ]);
    // URL.createObject creates a string containing a URL representing the object given in the parameter. 
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // the download method will download the given link url that we set with the file name we passed in
    a.download = `${model.ifcMetadata.name.replace(".ifc", "")}.frag` // setting html button element attribute 'download' to the filename string
    a.click()
    URL.revokeObjectURL(url)
}
function importFragments() {
    // creating an anonymous input
    const input = document.createElement('input')
    input.type = "file"
    input.accept = ".frag"
    const reader = new FileReader()
    input.addEventListener("change", () => {
        const filesList = input.files
        if ( !filesList ) {return}
        reader.readAsArrayBuffer(filesList[0])
    })
    reader.addEventListener("load", () => {
        const binary = reader.result
        if ( !(binary instanceof ArrayBuffer) ) {return}
        const fragmentBinary = new Uint8Array(binary)
        fragmentManager.load(fragmentBinary) // this will invoke the fragmentManager.onFragmentsLoaded event listener
    })
    input.click() // when we click the importFragmentBtn it clicks the input
}
async function viewerUIOnLoaded(model: FragmentsGroup) {
    await highlighter.updateHighlight()
    try {
        // ------ classifier config ------- //
        console.log('MODEL IFC - ', model)
        console.log("CLASSIFIER BEFORE", classifier.get())
        classifier.byModel(model.name, model)
        classifier.byStorey(model)
        classifier.byEntity(model)
        console.log("CLASSIFIER AFTER", classifier.get())
        // ------ fragmentTree and tree config ------- //
        // Creating fragment tree
        const tree = await createModelTree()
        // need to remove the previously generated tree before new one added
        await classificationWindow.slots.content.dispose(true)
        // now need to append the html element to the classification window. All UI compoenents have the addChild method
        // which allows you to append html to it
        classificationWindow.addChild(tree)
        // ------ IFC properties processor config ------- //
        ifcPropertiesProcessor.process(model)
        highlighter.events.select.onHighlight.add((fragmentMap) => {
            console.log('FRAGMENT MAP ON SELECT', fragmentMap)
            const expressID = [...Object.values(fragmentMap)[0]][0]
            ifcPropertiesProcessor.renderProperties(model, Number(expressID))
        })
    } catch (error) {
        throw error
    }
}







// ----------------------------- TESTING ------------------------------- //

// const classifier = new OBC.FragmentClassifier(viewer)
// const fragmentTree = new OBC.FragmentTree(viewer)

// ifcLoader.onIfcLoaded.add( async (fragmentGroup) => {
//     // classifier config
//     highlighter.update()
//     classifier.byModel(fragmentGroup.name, fragmentGroup)
//     classifier.byStorey(fragmentGroup)
//     classifier.byEntity(fragmentGroup)
//     await fragmentTree.init()
//     await fragmentTree.update(["model", "storeys", "entities"])
//     fragmentTree.onHovered.add((fragmentMap) => {
//         highlighter.highlightByID("hover", fragmentMap)
//     })
//     fragmentTree.onSelected.add((fragmentMap) => {
//         highlighter.highlightByID("select", fragmentMap)
//     })
//     const tree = fragmentTree.get().uiElement.get("tree")
//     classificationWindow.slots.content.dispose(true)
//     classificationWindow.addChild(tree)
// })


// ----------------------------- TESTING ------------------------------- //





// ------------------------------------- TESTING ADDING TOOL TO ANY DIV ELEMENT --------------------------------------- //


// const componentTools = new OBC.Components()

// const btnTest = new OBC.Button(componentTools);
// btnTest.materialIcon = "info";
// btnTest.tooltip = "Full screen";


// const tools = new OBC.Toolbar(componentTools)

// tools.addChild(btnTest)

}



// ------------------------------ THREE D VIEWER USING THREEJS ------------------------------- //



// const threeDViewer = new ThreeDViewer('viewer-test', 0.4, 5)
// threeDViewer.addAxisHelper()
// // threeDViewer.addGridHelper(10, 10)

// // -------- setting threeD viewers grid ------- //
// threeDViewer.gridHelper.setMaterialOpacity(0.4)
// threeDViewer.gridHelper.setMaterialTransparent(true)
// threeDViewer.gridHelper.setColor("#808080")

// // ------ threeD viewer GUI config ------- //

// // postion control
// threeDViewer.gui.cubeControls.add(threeDViewer.mesh.position, "x", -10, 10, 1) // can leave with just "x" for num input
// // or for num slider specify min max and step
// threeDViewer.gui.cubeControls.add(threeDViewer.mesh.position, "y", -10, 10, 1)
// threeDViewer.gui.cubeControls.add(threeDViewer.mesh.position, "z", -10, 10, 1)
// threeDViewer.gui.cubeControls.add(threeDViewer.mesh, "visible")
// threeDViewer.gui.cubeControls.addColor(threeDViewer.material, "color")
// // directional light controls
// threeDViewer.gui.directionalLightControls.addColor(threeDViewer.directionalLight, "color")
// threeDViewer.gui.directionalLightControls.add(threeDViewer.directionalLight.position, "x", -10, 10, 1)
// threeDViewer.gui.directionalLightControls.add(threeDViewer.directionalLight.position, "y", -10, 10, 1)
// threeDViewer.gui.directionalLightControls.add(threeDViewer.directionalLight.position, "z", -10, 10, 1)

// threeDViewer.gui.directionalLightControls.add(threeDViewer.directionalLight, "intensity", 0, 10, 1)
// threeDViewer.addSpotLight([0, 0, 10], "#fc0320")
// threeDViewer.addSpotLight([30, 10, 0], "#d5e310")

// // load obj file into threeJS
// threeDViewer.loader.objLoad("../Assets/Gear/Gear1.mtl", "../Assets/Gear/Gear1.obj")
// // load an gltf file into threeD viewer
// threeDViewer.loader.loadGLTF("./Assets/GLTFSample/Avocado.gltf")


// ------------------- THREE D VIEWER USING OBC (OPEN BIM COMPONENTS FROM THAT OPEN ENGINE) ------------------------- //

// const components = new OBC.Components()
// const mainToolbar = new OBC.Toolbar(components);
// mainToolbar.name = "Main toolbar";
// components.ui.addToolbar(mainToolbar);


// const alertButton = new OBC.Button(components);
// alertButton.materialIcon = "info";
// alertButton.tooltip = "Information";
// mainToolbar.addChild(alertButton);
// alertButton.onClick.add(() => {
// alert('I\'ve been clicked!');
// });