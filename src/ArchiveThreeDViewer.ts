'use strict'


// ------------------------------ IMPORTS ------------------------------- //


// importing three.js
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min"

import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"




// ------------------------------ THREE D VIEWER ------------------------------- //


export class ThreeDViewer {
    cameraPerspective: number
    scene: THREE.Scene
    viewer: HTMLElement
    viewerRect: DOMRect
    aspectRatio: number
    renderer: THREE.WebGL1Renderer
    camera: THREE.PerspectiveCamera
    directionalLight: THREE.DirectionalLight
    ambientLight: THREE.AmbientLight
    geometry: THREE.BoxGeometry
    material: THREE.Material | THREE.MeshStandardMaterial
    mesh: THREE.Mesh
    cameraControls: OrbitControls
    axisHelper: THREE.AxesHelper
    gridHelper: ThreeJSGridHelper
    gui: ThreeJSGUI
    loader: Loader
    // cubeControls: GUI

    constructor(domElementViewer: string,
        ambientLightIntensity: number,
        cameraPosition: number,
        geometry: THREE.BoxGeometry | undefined = undefined,
        material: THREE.Material | THREE.MeshStandardMaterial | undefined = undefined,
        ) {

        this.scene = new THREE.Scene()
        try {
            this.viewer = document.getElementById(domElementViewer) as HTMLElement
        } catch (error) {
            console.log(error)
        }
        this.cameraPerspective = 75
        this.viewerRect = this.viewer.getBoundingClientRect()
        this.renderer = new THREE.WebGL1Renderer({alpha: true, antialias: true}) // arg makes viewer transparent, antialias removes jag edges of geometry
        this.viewer.append(this.renderer.domElement)
        this.camera = new THREE.PerspectiveCamera(this.cameraPerspective, this.aspectRatio)
        this.updateAspectRatio()
        this.updateRenderSize()
        this.directionalLight = new THREE.DirectionalLight()
        this.ambientLight = new THREE.AmbientLight()
        if ( geometry === undefined ) {
            this.geometry = new THREE.BoxGeometry() // creating geometry to see in viewer
        } else {
            this.geometry = geometry
        }
        if ( material === undefined ) {
            this.material = new THREE.MeshStandardMaterial({color: '#4287f5'}) // create material using threejs for mesh below
        } else {
            this.material = material
        }
        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.setAmbientLightIntensity(ambientLightIntensity)
        this.setCameraPosition(cameraPosition)
        this.updateScene()
        this.cameraControls = new OrbitControls(this.camera, this.viewer)
        this.renderScene()
        this.resizeViewer()
        this.resize()
        // abstract classes
        this.gui = new ThreeJSGUI()
        this.gridHelper = new ThreeJSGridHelper(10, 10)
        this.scene.add(this.gridHelper.gridHelper)
        this.loader = new Loader(this)
    }
    
    updateRenderSize() {
        this.viewerRect = this.viewer.getBoundingClientRect()
        this.renderer.setSize(this.viewerRect.width, this.viewerRect.height)
    }

    updateAspectRatio() {
        this.aspectRatio = this.viewerRect.width / this.viewerRect.height
        this.camera.aspect = this.aspectRatio
    }

    updateScene() {
        this.scene.add(this.mesh, this.directionalLight, this.ambientLight)
    }

    renderScene() {
        // this will allow to run a function the next time the browser creates or renders a "frame" (fps)
        window.requestAnimationFrame(() => this.renderScene())
        // FINAL SETUP (this code needs to be at the end!!!) this takes frames (fps) frames (pictures) per second
        // so in order to capture all threeD viewer changes or additions, we need this at the end
        // need to tell the renderer the camera and the scene to use
        this.renderer.render(this.scene, this.camera)
    }

    resizeViewer() {
        this.viewerRect = this.viewer.getBoundingClientRect()
        this.renderer.setSize(this.viewerRect.width, this.viewerRect.height)
        this.updateAspectRatio()
        this.camera.updateProjectionMatrix()
    }

    resize() {
        window.addEventListener("resize", () => this.resizeViewer())
    }

    setAmbientLightIntensity(i: number) {
        this.ambientLight.intensity = i
    }

    setCameraPosition(pos: number) {
        this.camera.position.z = pos
    }

    addAxisHelper() {
        this.axisHelper = new THREE.AxesHelper( 5 )
        this.scene.add( this.axisHelper )
    }

    addSpotLight(pos: Array<number>, color: string) {
        const spotLight = new THREE.SpotLight(color)
        // this.scene.add(new THREE.SpotLight("#fc0320", 3, 20))
        const [x, y, z] = pos
        spotLight.position.set(x, y, z)
        this.scene.add(spotLight)
    }
}


class ThreeJSGUI {
    gui: GUI
    cubeControls: GUI
    directionalLightControls: GUI
    constructor() {
        this.gui = new GUI()
        // create an object for controls for the cube we have by using addFolder method on gui object
        // this will return a new object
        // thie input it takes is just the name of the group of controls that you are going to give it
        this.cubeControls = this.gui.addFolder("Cube")
        this.directionalLightControls = this.gui.addFolder('Light')
    }

}


class ThreeJSGridHelper {
    gridHelper: THREE.GridHelper
    constructor(size: number, division: number) {
        this.gridHelper = new THREE.GridHelper( size, division )
    }

    setMaterialTransparent(bool: boolean) {
        this.gridHelper.material.transparent = bool
    }

    setMaterialOpacity(opacity: number) {
        this.gridHelper.material.opacity = opacity
    }

    setColor(color: string) {
        this.gridHelper.material.color = new THREE.Color(color)
    }

}


class Loader {
    objLoader: OBJLoader
    mtlLoader: MTLLoader
    gltfLoader: GLTFLoader
    superClass: ThreeDViewer
    constructor(superClass: ThreeDViewer) {
        this.objLoader = new OBJLoader()
        this.mtlLoader = new MTLLoader()
        this.gltfLoader = new GLTFLoader()
        this.superClass = superClass
    }

    mtlLoad(mtlFilePath: string) {
        this.mtlLoader.load(mtlFilePath, (materials) => {
            materials.preload()
            this.objLoader.setMaterials(materials)
        })
    }

    objLoad(mtlFilePath: string | undefined, objFilePath: string) {
        if (mtlFilePath !== undefined) this.mtlLoad(mtlFilePath)
        this.objLoader.load(objFilePath, (meshesGrouped) => {
            this.superClass.scene.add(meshesGrouped)
            // this.superClass.geometry = meshesGrouped
        })
    }

    loadGLTF(filePath: string) {
        this.gltfLoader.load(filePath, (gltf) => {
            this.superClass.scene.add(gltf.scene)
        })
    }
}





