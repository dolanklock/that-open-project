import * as THREE from "three"
import * as OBC from "@thatopen/components"
import * as OBF from "@thatopen/components-front"
import * as BUI from "@thatopen/ui"
import projectInformation from "./components/Panels/ProjectInformation"
import elementData from "./components/Panels/Selection"
import settings from "./components/Panels/Settings"
import load from "./components/Toolbars/Sections/Import"
import help from "./components/Panels/Help"
import camera from "./components/Toolbars/Sections/Camera"
import selection from "./components/Toolbars/Sections/Selection"
import AIRenderer from "./bim-components/AIRenderer/AIRenderer"
import { AppManager } from "./bim-components"
// import { AIRenderer } from "./bim-components/AIRenderer"

export async function ThreeDViewer() {
  BUI.Manager.init()
  
  const components = new OBC.Components()
  const worlds = components.get(OBC.Worlds)
  
  const world = worlds.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBF.PostproductionRenderer>()
  world.name = "Main"
  
  world.scene = new OBC.SimpleScene(components)
  world.scene.setup()
  world.scene.three.background = null
  
  const viewport = BUI.Component.create<BUI.Viewport>(() => {
    return BUI.html`
      <bim-viewport>
        <bim-grid floating></bim-grid>
      </bim-viewport>
    `
  })
  
  world.renderer = new OBF.PostproductionRenderer(components, viewport)
  const { postproduction } = world.renderer;
  
  world.camera = new OBC.OrthoPerspectiveCamera(components)
  
  const worldGrid = components.get(OBC.Grids).create(world)
  worldGrid.material.uniforms.uColor.value = new THREE.Color(0x424242)
  worldGrid.material.uniforms.uSize1.value = 2
  worldGrid.material.uniforms.uSize2.value = 8
  
  const resizeWorld = () => {
    world.renderer?.resize()
    world.camera.updateAspect()
  }
  
  viewport.addEventListener("resize", resizeWorld)
  
  components.init()
  
  postproduction.enabled = true;
  postproduction.customEffects.excludedMeshes.push(worldGrid.three);
  postproduction.setPasses({ custom: true, ao: true, gamma: true })
  postproduction.customEffects.lineColor = 0x17191c
  
  const appManager = components.get(AppManager)
  const viewportGrid = viewport.querySelector<BUI.Grid>("bim-grid[floating]")!
  appManager.grids.set("viewport", viewportGrid)
  
  const fragments = components.get(OBC.FragmentsManager)
  const indexer = components.get(OBC.IfcRelationsIndexer)
  const classifier = components.get(OBC.Classifier)
  classifier.list.CustomSelections = {}
  
  const ifcLoader = components.get(OBC.IfcLoader)
  await ifcLoader.setup()
  
  const tilesLoader = components.get(OBF.IfcStreamer);
  tilesLoader.url = "../resources/tiles/";
  tilesLoader.world = world
  tilesLoader.culler.threshold = 10;
  tilesLoader.culler.maxHiddenTime = 1000;
  tilesLoader.culler.maxLostTime = 40000;
  
  const highlighter = components.get(OBF.Highlighter)
  highlighter.setup({ world })
  highlighter.zoomToSelection = true
  
  const culler = components.get(OBC.Cullers).create(world)
  culler.threshold = 50
  
  world.camera.controls.restThreshold = 0.25
  world.camera.controls.addEventListener("rest", () => {
    culler.needsUpdate = true
    tilesLoader.culler.needsUpdate = true;
  });
  
  fragments.onFragmentsLoaded.add(async (model) => {
    if (model.hasProperties) {
      await indexer.process(model);
      classifier.byEntity(model)
    }
  
    for (const fragment of model.items) {
      world.meshes.add(fragment.mesh)
      culler.add(fragment.mesh)
    }
  
    world.scene.three.add(model)
    setTimeout(async () => {
      world.camera.fit(world.meshes, 0.8)
    }, 50)
  })
  
  const APIKey = "5Dc5hLuEiPd9ie3PKG6Tv51hXDLlhU52iTOwPhqL6FJZdj6OC5cCYrngMpEq"

  // require('dotenv').config()
  // console.log("API KEY HERE FROM ENV", process.env)


  // dotenv.config();
  // console.log("API KEY HERE FROM ENV", process.env.API_KEY); // or any specific key

  // const processURL = "https://modelslab.com/api/v6/realtime/img2img";
  // const proxyURL = "https://cors-anywhere.herokuapp.com/"; // Avoids CORS locally
  // const uploadURL = "https://modelslab.com/api/v3/base64_crop";
  // const aiRenderer = new AIRenderer(components, APIKey, proxyURL, uploadURL, processURL)
  // aiRenderer.uiElement.get("RibbonUIComponent").get()

  const projectInformationPanel = projectInformation(components)
  const elementDataPanel = elementData(components)
  
  const toolbar = BUI.Component.create(() => {
    return BUI.html`
      <bim-toolbar>
        ${load(components)}
        ${camera(world)}
        ${selection(components, world)}
      </bim-toolbar>
    `
  })

  const aiRenderer = AIRenderer(components)
  console.log(aiRenderer)
  
  const leftPanel = BUI.Component.create(() => {
    return BUI.html`
      <bim-tabs switchers-full>
        <bim-tab name="project" label="Project" icon="ph:building-fill">
          ${projectInformationPanel}
        </bim-tab>
        <bim-tab name="settings" label="Settings" icon="solar:settings-bold">
          ${settings(components)}
        </bim-tab>
        <bim-tab name="help" label="Help" icon="material-symbols:help">
          ${help}
        </bim-tab>
        <bim-tab name="AI Renderer" label="AI Renderer" icon="material-symbols:help">
          <bim-panel>

            <bim-panel-section style="background-color: #22272e;" label="AI Render" icon="tabler:world">
              <div style="display: flex; gap: 0.375rem;">
                <bim-label icon="mingcute:rocket-fill">Prompt</bim-label>
                <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
              </div>
              <bim-button style="flex: 0;" label="Render" @click= icon="eva:expand-fill"></bim-button>
            </bim-panel-section>

            <bim-panel-section style="background-color: #22272e;" label="Settings" icon="tabler:world">
              <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div style="display: flex; flex-direction: column; gap: .5rem;">
                  <bim-label style="display: flex" icon="mingcute:rocket-fill">Negative prompt</bim-label>
                  <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                </div>
                <div style="display: flex; flex-direction: column; gap: .5rem;">
                  <bim-label style="display: flex" icon="mingcute:rocket-fill">Wifth</bim-label>
                  <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                </div>
                <div style="display: flex; flex-direction: column; gap: .5rem;">
                  <bim-label style="display: flex" icon="mingcute:rocket-fill">Height</bim-label>
                  <bim-text-input @input= vertical placeholder="Search..." debounce="200"></bim-text-input>
                </div>
              </div>
              <br>
              <bim-button style="flex: 0;" label="Update" @click= icon="eva:expand-fill"></bim-button>
            </bim-panel-section>

            <bim-panel-section style="background-color: #22272e;" label="Gallery" icon="tabler:world">
              <div style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="https://img.freepik.com/free-vector/tiny-people-developers-computer-working-core-system-core-system-development-all-one-software-solution-core-system-modernization-concept_335657-896.jpg?t=st=1717943201~exp=1717946801~hmac=b3d4fa56af20ddb28f508a58b22a14a035ac7678bda9a873f409aa2b489858e2&w=2000" alt="...">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                  <bim-label icon="">Urban Rendering</bim-label>
                  <bim-label icon="">modern home in urban environment</bim-label>
                  <bim-label icon="">Nov 23, 2024</bim-label>            
                </div>
              </div>

              <div style="width: 100%; height: fit-content; display: flex; flex-direction: column; border: 1px solid black; border-radius: 10px;">
                <img style="border-radius: 10px 10px 0px 0px" src="https://img.freepik.com/free-vector/tiny-people-developers-computer-working-core-system-core-system-development-all-one-software-solution-core-system-modernization-concept_335657-896.jpg?t=st=1717943201~exp=1717946801~hmac=b3d4fa56af20ddb28f508a58b22a14a035ac7678bda9a873f409aa2b489858e2&w=2000" alt="...">
                <div style="color: white; width: 100%; height: fit-content; display: flex; flex-direction: column; padding: 10px;">
                  <bim-label icon="">Urban Rendering</bim-label>
                  <bim-label icon="">modern home in urban environment</bim-label>
                  <bim-label icon="">Nov 23, 2024</bim-label>            
                </div>
              </div>

            </bim-panel-section>


          </bim-panel>
        </bim-tab>
        <bim-tab name="AI" label="AI" icon="material-symbols:help">
          ${aiRenderer}
        </bim-tab>

      </bim-tabs> 
    `
  })
  
  const app = document.getElementById("app") as BUI.Grid
  app.layouts = {
    main: {
      template: `
        "leftPanel viewport" 1fr
        /26rem 1fr
      `,
      elements: {
        leftPanel,
        viewport,
      }
    }
  }
  
  app.layout = "main"
  
  viewportGrid.layouts = {
    main: {
      template: `
        "empty" 1fr
        "toolbar" auto
        /1fr
      `, 
      elements: { toolbar }
    },
    second: {
      template: `
        "empty elementDataPanel" 1fr
        "toolbar elementDataPanel" auto
        /1fr 24rem
      `, 
      elements: {
        toolbar,
        elementDataPanel
      }
    },
  }
  
  viewportGrid.layout = "main"

}