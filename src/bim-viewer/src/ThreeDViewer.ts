/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable prettier/prettier */
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
import {Renderer} from "./bim-components/AIRendererTab/AIRendererTab"
import AIRendererVThree from "./bim-components/AIRendererV3/AIRendererVThree"
import AIRendererVFour from "./bim-components/AIRendererV4/AIRendererVFour"

import AIRendererVersionFive from "./bim-components/AIRendererV5/AIRendererVFive"
import { Gallery } from "./bim-components/AIRendererV5/src/DataBase/RenderLibraryDB"
import { Library } from "./bim-components/AIRendererV5/src/LibraryComponent"

import { AppManager } from "./bim-components"
import { DiscordIntegration } from "./bim-components/DiscordIntegration"
import { DiscordIntegrationUI } from "./bim-components/DiscordIntegration/user-interface"
import { Comments } from "./bim-components/Comments";
import { auth } from "../../firebase"
import { GeminiConnector } from "./bim-components/GeminiConnector"
import  {Ollama} from 'ollama'
import test from "node:test"

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


  const galleryDb = new Gallery()
//   const AI = AIRendererVersionFive(components, galleryDb)
  const library = new Library(components, galleryDb)


  document.querySelector("body")?.appendChild(library.mainContainer)


  
  world.renderer = new OBF.PostproductionRenderer(components, viewport)
  const { postproduction } = world.renderer;
  // postproduction.postproduction.composer.render()
  postproduction.composer.render()
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

  const projectInformationPanel = projectInformation(components)
  const elementDataPanel = elementData(components)

  const viewer = document.getElementById("bim-container") as HTMLDivElement
  // const renderer = new Renderer(components, viewer)

  const discordIntegration = new DiscordIntegration(components)
  discordIntegration.setup()

  const comments = components.get(Comments)
  // comments.enabled = true
  comments.world = world
  



//   const galleryDb = new Gallery()
//   const AI = AIRendererVersionFive(components, galleryDb)
//   const library = new Library(components, galleryDb)





  comments.onCommentAdded.add(comment => {
    const currentUser = auth.currentUser?.displayName
    if (!currentUser) return
    if (!comment.position) return
    const commentBubble = BUI.Component.create(() => {
      const commentsTable = document.createElement("bim-table")
      commentsTable.headersHidden = true
      commentsTable.expanded = true
      const setTableData = () => {
        const groupData: BUI.TableGroupData = {
          data: { displayName: `${currentUser}: `, Comment: comment.text }
        }
        commentsTable.data = [groupData]
        if (comment.replies.length > 0) {
          groupData.children = comment.replies.map<BUI.TableGroupData>((reply) => {
            return {
              data: { displayName: `${currentUser}: `, Comment: reply },
            }
          })
        }
      }
      const onReplyClick = () => {
        const reply = prompt("Relpy:")
        if (!reply) return
        comment.replies.push(reply)
        setTableData()
      }
  
      setTableData()
      return BUI.html`
      <div>
        <bim-panel style="min-width: 0; max-width: 20rem; max-height: 20rem; border-radius: 1rem;">
          <bim-panel-section icon="material-symbols:comment" collapsed>
            ${commentsTable}
            <bim-button @click=${onReplyClick} label="Add reply"></bim-button>
          </bim-panel-section>
        </bim-panel> 
      </div>
      `
    })
    // this here is adding the html CSS2DObject to the worlds html container
    const commentMark = new OBF.Mark(world, commentBubble)
    commentMark.three.position.copy(comment.position)
  })

  const onCommentClick = () => {
    comments.enabled = !comments.enabled
    const btn = commentSection.querySelector("bim-button") as BUI.Button
    if (comments.enabled) {
      btn.style.backgroundColor = "#6610f2"
      btn.style.borderRadius = "5px"
    } else {
      btn.style.backgroundColor = "transparent"
    }
  }
  
  const commentSection = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="Comments" icon="material-symbols:comment">
        <bim-button @click=${onCommentClick} label="On/Off" icon="material-symbols:mode-off-on" tooltip-title="Focus" tooltip-text="Toggle on to add 2D comments to 3D objects"></bim-button>
      </bim-toolbar-section> 
    `;
  });

  // It is really important to learn how to use the env variables
  // This way we don't hardcode our API keys in the code
  // But be aware that this is no definite solution as a console.log can print
  // the value if someone is using it in another computer.
  // Check out the documentation for more info.
  // const APIKEY = import.meta.env.VITE_APIKEY;
  const geminiConnector = components.get(GeminiConnector);
  geminiConnector.apiKey = "AIzaSyBZt2UMyrt0NcYAIOw7I79CyV1O9V6gc4s"
  geminiConnector.setup()
  console.log(geminiConnector._aiModel)

  // ------------------------- TESTING OLLAMA -------------------------- //
  const testBtn = document.createElement("button")
  async function runOllama() {
    console.log("running llama")
    const ollama = new Ollama()
    // await ollama.pull({model: 'llama2'})
    const resOllama = await ollama.chat({
      model: 'mistral',
      messages: [{ role: 'user', content: 'Why is the sky blue?' }],
    })
    
    console.log("ollama response", resOllama.message.content)
    // const imagePath = './examples/multimodal/cat.jpg'
    // const response = await ollama.generate({
    //   model: 'mistral',
    //   prompt: 'describe this image:',
    //   stream: true,
    // })
    // for await (const part of response) {
    //   process.stdout.write(part.response)
    // }
  }
  
  const test = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="ollama" icon="material-symbols:comment">
        <bim-button @click=${runOllama} label="On/Off" icon="material-symbols:mode-off-on" tooltip-title="Focus" tooltip-text="Toggle on to add 2D comments to 3D objects"></bim-button>
      </bim-toolbar-section> 
    `;
  });

  // ------------------------- TESTING OLLAMA -------------------------- //

  // ------------------------- TESTING GETTING CORRECT DATA FORMAT -------------------------- //

  async function runTest() {
    await geminiConnector.processSelectionTest()
  }

  const test1 = BUI.Component.create<BUI.PanelSection>(() => {
    return BUI.html`
      <bim-toolbar-section label="GET DATA" icon="material-symbols:comment">
        <bim-button @click=${runTest} label="RUN" icon="material-symbols:mode-off-on" tooltip-title="Focus" tooltip-text="Toggle on to add 2D comments to 3D objects"></bim-button>
      </bim-toolbar-section> 
    `;
  });

  // ------------------------- TESTING GETTING CORRECT DATA FORMAT -------------------------- //

  const toolbar = BUI.Component.create(() => {
    return BUI.html`
      <bim-toolbar>
        ${load(components)}
        ${camera(world)}
        ${selection(components, world)}
        ${AIRendererVFour(components)}
        ${AIRendererVersionFive(components, galleryDb, library)}
        ${DiscordIntegrationUI(components, world)}
        ${commentSection}
        ${test}
        ${test1}
      </bim-toolbar>
    `
  })


  const aiRenderer = AIRenderer(components)
  
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
        <bim-tab name="AI" label="AI Renderer" icon="material-symbols:help">
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
        elementDataPanel,
      }
    },
  }
  
  viewportGrid.layout = "main"

}
