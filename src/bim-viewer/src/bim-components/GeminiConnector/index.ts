/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
import {
  GenerativeModel,
  GoogleGenerativeAI as GoogleAI,
} from "@google/generative-ai";

import { Ollama } from 'ollama'

import * as OBC from "@thatopen/components";
import { FragmentIdMap } from "@thatopen/fragments";
import { Fragment, FragmentsGroup } from "bim-fragment";
import * as WEBIFC from "web-ifc"

export interface GeminiConnectorConfig {
  apiKey: string | null;
  modelName: "gemini-1.5-flash";
}


interface Properties {
  [modelID: string]: {
    [expressID: number]: {
      Name: string;
      Properties: { Name: string; Value: string | boolean | number }[];
    }[];
  };
}

interface testing {
  [category: string]: [{}]
}

interface Iobj {
  [expressID: number]: [{
    Name: string;
    Properties: { Name: string; Value: string | boolean | number }[];
  }]
}

export class GeminiConnector extends OBC.Component {
    // This implementation obligates us to use <isSetup, onSetup, setup>
    enabled = false;
    static readonly uuid = "15522f28-c3aa-4893-97db-aa15647518fc" as const;
    isSetup: boolean = false;
    readonly onSetup = new OBC.Event<GeminiConnector>();
    private _aiModel: GenerativeModel | null = null;
    private _indexer = this.components.get(OBC.IfcRelationsIndexer);
    private _fragmentsManager = this.components.get(OBC.FragmentsManager);
    modelName: string
    private _apiKey: string = ""

    constructor(components: OBC.Components) {
    super(components);
    components.add(GeminiConnector.uuid, this);
    // Here we assign the values with an object
    // The key is the name written the way the Gemini API requires it
    // The value is a more readable and good looking name
    this.modelName = "gemini-1.5-flash"
    }
    set apiKey(apiKey: string) {
    this._apiKey = apiKey
    }

    setup() {
    if (this.isSetup) return;
    if (this._apiKey === "") {
        throw new Error("Gemini Connector: There is no API Key set!");
    }
    const genAI = new GoogleAI(this._apiKey);
    this._aiModel = genAI.getGenerativeModel({ model: this.modelName });
    this.enabled = true;
    this.isSetup = true;
    this.onSetup.trigger(this);
    }

    updateModal() {
        this._aiModel = new GoogleAI(this._apiKey).getGenerativeModel({ model: this.modelName })
    }
    // TODO: find a way to search the whole model and not only query by selected elements
    // could then have method for exporting selected elements data to excel
    // overall model query could be like "select all doors that have a fire rating of value 1 or greater"

    // step 1. find way to get all express ids of walls, floors, etc. grouped together
    // step 2. get entity and save as selection for all entites in the group (look at save selection code)

    // STEP 1. figure out what data format i need in order to save each element in a selection. look
    // at custom selection code and figure out what i need. I need to get the entity and save each element
    // as a selection. need to iterate through, get all walls and add to selection in order to save it

    async getModelDataByCategory() {
        if (!this._aiModel) {
            throw new Error("no ai model")
            // return {}
        };
    // Data structure to pas  s to Gemini
    const data: Properties = {};

    const fragmentid = this._fragmentsManager.list.entries().next().value[0]
    const fragment = this._fragmentsManager.list.get(fragmentid)
    if (!fragment) {
        throw new Error("fragment is undefined")
    }
    console.log("frag test", fragment)
    const expressIds = fragment.ids

    console.log("EXPRESS IDS", expressIds)

    // Selection is given by the Highlighter from the UI, iterate each fragment ID

    const model = fragment.group
    if (!model) {
        throw new Error("model not defined")
    }

    // First level of the structure
    if (!(model.uuid in data)) data[model.uuid] = {};
    if (!expressIds) throw new Error("express ids is empty")
    for (const expressID of expressIds) {
        // Second level
        data[model.uuid][expressID] = [];

        // Get current Psets, if updated, will update its reference (used way below)
        const elementPsets = data[model.uuid][expressID];

        // Return related expressIds to current element in selection
        const relations = this._indexer.getEntityRelations(
            model,
            expressID,
            "IsDefinedBy",
        );
        if (!relations) {
            console.log("no relations")
            continue;
        }

        // console.log("expressid", expressID)
        // console.log("relations", relations)
        

        // If there are multiple relations...
        for (const relatedId of relations) {
        const pset = await model.getProperties(relatedId);

        // Make sure there are properties for relation and extract values
        if (!(pset && pset.HasProperties)) continue;

        // First create the object for the data structure
        const fullPset: { Name: string; Properties: any[] } = {
            Name: pset.Name?.value,
            // With an empty properties value
            Properties: [],
        };

        // Each handle contains a property
        const hasProperties = [];
        for (const handle of pset.HasProperties) {
            const propId = handle.value;
            const propAttrs = await model.getProperties(propId);
            if (
            propAttrs &&
            propAttrs.Name?.value &&
            propAttrs.NominalValue?.value
            ) {
            const prop = {
                Name: propAttrs.Name.value,
                Value: propAttrs.NominalValue.value,
            };
            // Finish creating the properties object
            hasProperties.push(prop);
            }
        }
        // Update the empty properties
        fullPset.Properties = hasProperties;

        // Update by reference the data structure
        elementPsets.push(fullPset);
        }
    // console.log(elementPsets)
    // console.log("************************************************")
    }

        console.log("dfsdf", Object.values(data)[0])
        const outputData: testing = {}
        const allExpressIdObj = Object.values(data)[0]
        for ( const [expressID, properties] of Object.entries(allExpressIdObj) ) {
        // console.log(expressID, properties)
        // get the value for property of category
        for ( const property of properties ) {
            console.log(property)
            if ( property.Name === "Identidad" ) {
                // console.log("entered identidad")
                const identidadProperties = property.Properties

                for (const p of identidadProperties ) {
                    console.log("test", p)
                    if (p.Name === "Categoría") {
                        // console.log("entered categoria")
                        const categoryName = p.Value as string // this is "Walls"
                        console.log("CAT NAME", categoryName)
                        if (outputData[categoryName]) {
                            // const expressIDKey = expressID
                            const obj = {}
                            obj[expressID] = properties
                            console.log(`${categoryName} is in outputData`)
                            console.log(`outputData: ${outputData}`)
                            outputData[categoryName].push(obj)
                            // outputData[categoryName].push({"test": "test1"})
                            // need the outputData object to be same format as data in other method
                            // only difference is it stores the data per category
                        } else {
                            const obj = {}
                            obj[expressID] = properties
                            outputData[categoryName] = [obj]
                        }
                    }
                }
            }
            }
        }
        console.log("FINAL OUTPUT", outputData)

        return outputData;
    }




    async getModelData() {
    if (!this._aiModel) {
        throw new Error("no ai model")
        // return {}
    };
    // Data structure to pas  s to Gemini
    const data: Properties = {};

    const fragmentid = this._fragmentsManager.list.entries().next().value[0]
    const fragment = this._fragmentsManager.list.get(fragmentid)
    if (!fragment) {
        throw new Error("fragment is undefined")
    }
    console.log("frag test", fragment)
    const expressIds = fragment.ids

    console.log("EXPRESS IDS", expressIds)

    // Selection is given by the Highlighter from the UI, iterate each fragment ID

    const model = fragment.group
    if (!model) {
        throw new Error("model not defined")
    }

    // First level of the structure
    if (!(model.uuid in data)) data[model.uuid] = {};
    if (!expressIds) throw new Error("express ids is empty")
    for (const expressID of expressIds) {
        // Second level
        data[model.uuid][expressID] = [];

        // Get current Psets, if updated, will update its reference (used way below)
        const elementPsets = data[model.uuid][expressID];

        // Return related expressIds to current element in selection
        const relations = this._indexer.getEntityRelations(
        model,
        expressID,
        "IsDefinedBy",
        );
        if (!relations) {
        console.log("no relations")
        continue;
        }

        // console.log("expressid", expressID)
        // console.log("relations", relations)
        

        // If there are multiple relations...
        for (const relatedId of relations) {
        const pset = await model.getProperties(relatedId);

        // Make sure there are properties for relation and extract values
        if (!(pset && pset.HasProperties)) continue;

        // First create the object for the data structure
        const fullPset: { Name: string; Properties: any[] } = {
            Name: pset.Name?.value,
            // With an empty properties value
            Properties: [],
        };

        // Each handle contains a property
        const hasProperties = [];
        for (const handle of pset.HasProperties) {
            const propId = handle.value;
            const propAttrs = await model.getProperties(propId);
            if (
            propAttrs &&
            propAttrs.Name?.value &&
            propAttrs.NominalValue?.value
            ) {
            const prop = {
                Name: propAttrs.Name.value,
                Value: propAttrs.NominalValue.value,
            };
            // Finish creating the properties object
            hasProperties.push(prop);
            }
        }
        // Update the empty properties
        fullPset.Properties = hasProperties;

        // Update by reference the data structure
        elementPsets.push(fullPset);
        }
    // console.log(elementPsets)
    // console.log("************************************************")
    }
    // for (const i in data ) {
    //   console.log("DATA: ", i)
    // }
    Object.values(data).map((i) => {
    console.log("DATA: ", i)
    })
    return data;
    }

    async processSelectionTest() {
        if (!this._aiModel) {
            throw new Error("no ai model")
            // return {}
        };
        // Data structure to pas  s to Gemini
        const data: Properties = {};

        const fragmentid = this._fragmentsManager.list.entries().next().value[0]
        const fragment = this._fragmentsManager.list.get(fragmentid)
        if (!fragment) {
            throw new Error("fragment is undefined")
        }
        console.log("frag test", fragment)

        // const modelDataByCategory = await this.getModelDataByCategory()

        // const walls = modelDataByCategory.Walls
        // // console.log("WALLS", walls)
        // const expressIds = new Set()
        // for (const obj of walls) {
        //   // console.log("OBJECT", obj)
        //   expressIds.add(Number(Object.keys(obj)[0]))
        // }


        // console.log("all walls", expressIds)
        // const expressIds = Object.keys(walls)
        // console.log("EXPRESS IDS", expressIds)
        // const expressIds = fragment.ids

        // console.log("EXPRESS IDS", expressIds)

        // Selection is given by the Highlighter from the UI, iterate each fragment ID

        const model = fragment.group
        if (!model) {
            throw new Error("model not defined")
        }


        // testing //
        // const ifcApi = new WEBIFC.IfcAPI();
        // const wallsTest = ifcApi.GetLineIDsWithType(model.uuid, WEBIFC.IFCWALL); // this gets all expressIDs of all wall entities in the IFC
        // testing //

        const columns = await model.getAllPropertiesOfType(WEBIFC.IFCWALL)

        let expressIds = new Set()
        for (const id in columns) {
            // console.log(id)
            expressIds.add(Number(id))
        }
        let arr = Array.from(expressIds)
        arr = arr.splice(2, 23)
        console.log("ARRAY", arr)
        expressIds = new Set(arr)


        // First level of the structure
        if (!(model.uuid in data)) data[model.uuid] = {};
        if (!expressIds) throw new Error("express ids is empty")
        for (const expressID of expressIds) {
            // Second level
            data[model.uuid][expressID] = [];

            // Get current Psets, if updated, will update its reference (used way below)
            const elementPsets = data[model.uuid][expressID];

            // Return related expressIds to current element in selection
            const relations = this._indexer.getEntityRelations(
            model,
            expressID,
            "IsDefinedBy",
            );
            if (!relations) {
            console.log("no relations")
            continue;
            }

            // console.log("expressid", expressID)
            // console.log("relations", relations)
            

            // If there are multiple relations...
            for (const relatedId of relations) {
            const pset = await model.getProperties(relatedId);

            // Make sure there are properties for relation and extract values
            if (!(pset && pset.HasProperties)) continue;

            // First create the object for the data structure
            const fullPset: { Name: string; Properties: any[] } = {
                Name: pset.Name?.value,
                // With an empty properties value
                Properties: [],
            };

            // Each handle contains a property
            const hasProperties = [];
            for (const handle of pset.HasProperties) {
                const propId = handle.value;
                const propAttrs = await model.getProperties(propId);
                if (
                propAttrs &&
                propAttrs.Name?.value &&
                propAttrs.NominalValue?.value
                ) {
                const prop = {
                    Name: propAttrs.Name.value,
                    Value: propAttrs.NominalValue.value,
                };
                // Finish creating the properties object
                hasProperties.push(prop);
                }
            }
            // Update the empty properties
            fullPset.Properties = hasProperties;

            // Update by reference the data structure
            elementPsets.push(fullPset);
            }
        }
        return data;
    }

    // This code goes inside the GeminiConnector Class
    private async processSelection(selection: FragmentIdMap) {
    // If setup has not been invoked
    if (!this._aiModel) return {};

    // Data structure to pass to Gemini
    const data: Properties = {};

    // Selection is given by the Highlighter from the UI, iterate each fragment ID
    for (const fragmentId in selection) {
        // Each fragment id has expressids related
        const expressIds = selection[fragmentId];

        // Get IFC model
        const fragment = this._fragmentsManager.list.get(fragmentId);
        if (!(fragment && fragment.group)) continue;
        const model = fragment.group;

        // First level of the structure
        if (!(model.uuid in data)) data[model.uuid] = {};

        for (const expressID of expressIds) {
        // Second level
        data[model.uuid][expressID] = [];

        // Get current Psets, if updated, will update its reference (used way below)
        const elementPsets = data[model.uuid][expressID];

        // Return related expressIds to current element in selection
        const relations = this._indexer.getEntityRelations(
            model,
            expressID,
            "IsDefinedBy",
        );
        if (!relations) {
            continue;
        }

        // If there are multiple relations...
        for (const relatedId of relations) {
            const pset = await model.getProperties(relatedId);

            // Make sure there are properties for relation and extract values
            if (!(pset && pset.HasProperties)) continue;

            // First create the object for the data structure
            const fullPset: { Name: string; Properties: any[] } = {
            Name: pset.Name?.value,
            // With an empty properties value
            Properties: [],
            };

            // Each handle contains a property
            const hasProperties = [];
            for (const handle of pset.HasProperties) {
            const propId = handle.value;
            const propAttrs = await model.getProperties(propId);
            if (
                propAttrs &&
                propAttrs.Name?.value &&
                propAttrs.NominalValue?.value
            ) {
                const prop = {
                Name: propAttrs.Name.value,
                Value: propAttrs.NominalValue.value,
                };
                // Finish creating the properties object
                hasProperties.push(prop);
            }
            }
            // Update the empty properties
            fullPset.Properties = hasProperties;

            // Update by reference the data structure
            elementPsets.push(fullPset);
        }
        }
    }

    return data;
    }

    // have predefined selections built in already for gemini and then can select all elements first for prompt
    // should have code that on model load will create all saved selections for each category
    // should have drop down for selections of each category in it (walls, floors, roofs, structural framing, etc)
    // *it seems that the LLM has trouble parsing all model ifc entities. Too much data for it to parse through
    async ask(prompt: string, selection: FragmentIdMap, bySelection: boolean) {
        if (!(this.isSetup && this._aiModel)) return {};

        // Iterate the FragmentIdMap from the selection of the highlighter

        const data = await this.processSelectionTest()
        // const data = await this.processSelection(selection)

        // let data;
        // if (bySelection) {
        //   data = await this.processSelectionTest()
        //   // data = await this.processSelection(selection, bySelection)
        // } else {
        //   data = await this.getModelData()
        // }
        console.log("raw data", data)

        // console.log("data for gemini", data)
        console.log(JSON.stringify(data))

        const request = `
        You are an IFC assistant. I will provide information in the following structure:

        interface Properties {
            [modelID: string]: { 
            [expressID: number]: { 
                Name: string,
                Properties: { Name: string, Value: string | boolean | number }[]
            }[]
            };
        }

        Where the following is always true: 

        - The modelID is a UUID v4.
        - The expressID is always a number of any length.

        Your job is to tell me: ${prompt}. 

        The following is the input data:

        ${JSON.stringify(data)}

        Your answer must be a JSON with the following structure:

        interface Response {
            [modelID: string]: number[]
        }

        Where the following is always true:

        - modelID MUST BE a UUID v4 based on the ones given in the input data. 
        - number[] is the list of expressID containing the requested information.
        - Always group expressID belonging to the same modelID.

        If no elements meet the criteria, then you must answer with an empty JSON object, like {}.

        These are examples of valid responses:

        - {
            "cd51c260-a3a6-4cc8-8206-1c0c25dd72d3": [123,234,6575,923,14656]
            }
        - {
            "272b6773-21a7-48ea-b793-80a9789c5448": [8128],
            "f66bfab1-6a8e-48cd-b6d6-0aa49420c4ef": [612,548],
            }
        - {}

        Anything that doesn't comply with the Response interface, is not valid and you must return an empty object like {}.

        Do not include anything else in the response, neither any kind of formatting. Just plain text with the JSON structure I provided you. 

        The response will be used in JSON.parse().
        `

        // const ollama = new Ollama()
        // // await ollama.pull({model: 'llama2'})
        // const resOllama = await ollama.chat({
        //   model: 'gemma2',
        //   messages: [{ role: 'user', content: request }],
        // })

        // console.log("ollama response", resOllama.message.content)

        // Provide Gemini with the full prompt via the API's method.
        const { response } = await this._aiModel.generateContent(request)
        console.log(response)

        const text = response.text();
        console.log("text response from gemini", text)
        let fragmentIdMap = {};

        // if (!(text[text.length-1]  === "}")) {
        //   text += "]}"
        //   console.log("does not have correct ending")
        // }

        console.log(text)
        // console.log("LAST STRING", text[text.length-1])


        try {
            const modelIdMap = JSON.parse(text);

            // From the Gemini response, take the modelId and array of expressIds
            // and turn it into a FragmentIdMap
            for (const modelID in modelIdMap) {
            const fragments = this.components.get(OBC.FragmentsManager);

            // Use modelId in the response
            const model = fragments.groups.get(modelID);
            if (!model) continue;

            // Get the array of expressIds
            const expressIDs = modelIdMap[modelID];

            // Union current map with the new data
            fragmentIdMap = {
                ...fragmentIdMap,
                ...model.getFragmentMap(expressIDs),
            };
            }
        } catch (error) {
            console.warn("The AI response couldn't be parsed.");
        }

        return fragmentIdMap;
    }

}


const test = [
  {"Walls": [
    {"2324fbgfg534534fg634gf5gfg4": {34534: [{}, {}, {}], 341534: [{}, {}, {}]}}
  ]}
]















// async ask(prompt: string, selection: FragmentIdMap) {
//   if (!(this.isSetup && this._aiModel)) return {};

//   // Iterate the FragmentIdMap from the selection of the highlighter
//   const data = await this.processSelection(selection);

//   // Provide Gemini with the full prompt via the API's method.
//   const { response } = await this._aiModel.generateContent(`
//     You are an IFC assistant. I will provide information in the following structure:

//     interface Properties {
//       [modelID: string]: { 
//         [expressID: number]: { 
//           Name: string,
//           Properties: { Name: string, Value: string | boolean | number }[]
//         }[]
//       };
//     }

//     Where the following is always true: 
    
//     - The modelID is a UUID v4.
//     - The expressID is always a number of any length.

//     Your job is to tell me: ${prompt}. 
    
//     The following is the input data:
    
//     ${JSON.stringify(data)}

//     Your answer must be a JSON with the following structure:

//     interface Response {
//       [modelID: string]: number[]
//     }

//     Where the following is always true:
    
//     - modelID MUST BE a UUID v4 based on the ones given in the input data. 
//     - number[] is the list of expressID containing the requested information.
//     - Always group expressID belonging to the same modelID.
    
//     If no elements meet the criteria, then you must answer with an empty JSON object, like {}.

//     These are examples of valid responses:

//     - {
//         "cd51c260-a3a6-4cc8-8206-1c0c25dd72d3": [123,234,6575,923,14656]
//       }
//     - {
//         "272b6773-21a7-48ea-b793-80a9789c5448": [8128],
//         "f66bfab1-6a8e-48cd-b6d6-0aa49420c4ef": [612,548],
//       }
//     - {}

//     Anything that doesn't comply with the Response interface, is not valid and you must return an empty object like {}.

//     Do not include anything else in the response, neither any kind of formatting. Just plain text with the JSON structure I provided you. 
    
//     The response will be used in JSON.parse().
//   `);

//   const text = response.text();
//   let fragmentIdMap = {};

//   try {
//     const modelIdMap = JSON.parse(text);

//     // From the Gemini response, take the modelId and array of expressIds
//     // and turn it into a FragmentIdMap
//     for (const modelID in modelIdMap) {
//       const fragments = this.components.get(OBC.FragmentsManager);

//       // Use modelId in the response
//       const model = fragments.groups.get(modelID);
//       if (!model) continue;

//       // Get the array of expressIds
//       const expressIDs = modelIdMap[modelID];

//       // Union current map with the new data
//       fragmentIdMap = {
//         ...fragmentIdMap,
//         ...model.getFragmentMap(expressIDs),
//       };
//     }
//   } catch (error) {
//     console.warn("The AI response couldn't be parsed.");
//   }

//   return fragmentIdMap;
// }















// private async processSelection(selection: FragmentIdMap, bySelection: boolean) {
//   // If setup has not been invoked
//   if (!this._aiModel) return {};
//   console.log("SELECTION", selection)
//   // Data structure to pass to Gemini
//   const data: Properties = {};

//   let expressIds
  
//   if (!bySelection) {
//     console.log("running byselection is false")
//     const fragmentd = this._fragmentsManager.list.entries().next().value[0]
//     const fragment = this._fragmentsManager.list.get(fragmentd)
//     console.log("frag test", fragment)
//     expressIds = fragment.ids
//   }
//   console.log("EXPRESS IDS", expressIds)

//   // Selection is given by the Highlighter from the UI, iterate each fragment ID
//   for (const fragmentId in selection) {
//     // Each fragment id has expressids related
//     if (bySelection) {
//       expressIds = selection[fragmentId];
//     }
//     console.log("EXPRESS IDS", expressIds)

//     // Get IFC model
//     const fragment = this._fragmentsManager.list.get(fragmentId);
//     // console.log("fragment", fragment)
//     // console.log("fragment", fragment.ids)
//     // for (const eID of fragment?.ids) console.log(eID)

//     if (!(fragment && fragment.group)) continue;

//     const model = fragment.group;

//     // First level of the structure
//     if (!(model.uuid in data)) data[model.uuid] = {};
//     if (!expressIds) throw new Error("express ids is empty")
//     for (const expressID of expressIds) {
//       console.log("expressid", expressID)
//       // Second level
//       data[model.uuid][expressID] = [];

//       // Get current Psets, if updated, will update its reference (used way below)
//       const elementPsets = data[model.uuid][expressID];

//       // Return related expressIds to current element in selection
//       const relations = this._indexer.getEntityRelations(
//         model,
//         expressID,
//         "IsDefinedBy",
//       );
//       if (!relations) {
//         continue;
//       }

//       // If there are multiple relations...
//       for (const relatedId of relations) {
//         const pset = await model.getProperties(relatedId);

//         // Make sure there are properties for relation and extract values
//         if (!(pset && pset.HasProperties)) continue;

//         // First create the object for the data structure
//         const fullPset: { Name: string; Properties: any[] } = {
//           Name: pset.Name?.value,
//           // With an empty properties value
//           Properties: [],
//         };

//         // Each handle contains a property
//         const hasProperties = [];
//         for (const handle of pset.HasProperties) {
//           const propId = handle.value;
//           const propAttrs = await model.getProperties(propId);
//           if (
//             propAttrs &&
//             propAttrs.Name?.value &&
//             propAttrs.NominalValue?.value
//           ) {
//             const prop = {
//               Name: propAttrs.Name.value,
//               Value: propAttrs.NominalValue.value,
//             };
//             // Finish creating the properties object
//             hasProperties.push(prop);
//           }
//         }
//         // Update the empty properties
//         fullPset.Properties = hasProperties;

//         // Update by reference the data structure
//         elementPsets.push(fullPset);
//       }
//     }
//   }

//   return data;
// }